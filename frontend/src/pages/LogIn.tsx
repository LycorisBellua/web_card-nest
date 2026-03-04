import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  sanitizeEmail,
  sanitizePassword,
} from 'functions/UserSanitation';
import {
  validateEmail,
  validatePassword,
} from 'functions/UserValidation';
import {
  Container,
  FormGroup,
  ErrorText,
  ButtonSubmitWrapper,
  SuccessMsg,
} from 'components/style/SignForm';

function LogIn() {
  const [logMail, setLogMail] = useState('');
  const [logPwd, setLogPwd] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handlerLogin(e: any) {
    e.preventDefault();
    if (!logMail || !logPwd) {
      setErrors(['Fields should not be empty']);
      return;
    }
    setErrors([])
    setMessage("")
    const loginEmail = sanitizeEmail(logMail)
    const loginPwd = sanitizePassword(logPwd)
    const allErrors = [
      ...validateEmail(loginEmail),
      ...validatePassword(loginPwd, loginEmail, loginEmail)
    ]
    if (allErrors.length > 0) {
      console.log(allErrors)
      setErrors(allErrors)
      return
    }
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos');
      const data = await res.json();
      if (!res.ok) {
        setErrors([data.message]);
        return;
      }
      setMessage('Login success! Redirecting to placeholder...');
      setLogMail("")
      setLogPwd("")
      setErrors([])
      setTimeout(() => navigate('/placeholder'), 3000);
    } catch (err) {
      setErrors(['Internal error']);
    }
  }

  return (
    <Container>
      <h1>Log In</h1>
      <form onSubmit={handlerLogin}>
        <FormGroup>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="text"
            autoComplete="on"
            value={logMail}
            onChange={(e) => setLogMail(e.target.value)}
          ></input>
        </FormGroup>
        <FormGroup>
          <label htmlFor="password">Password</label>
          <input
              id="password"
              type="password"
              autoComplete="on"
              value={logPwd}
              onChange={(e) => setLogPwd(e.target.value)}
          ></input>
        </FormGroup>
        <ErrorText>
          {errors && errors.map((err,i)=><p key={i}>{err}</p>)}
        </ErrorText>
        <ButtonSubmitWrapper>
          <button type="submit">Log In</button>
        </ButtonSubmitWrapper>
      </form>
      {message && <SuccessMsg>{message}</SuccessMsg>}
      <Link to="/reset-pwd">
      <ButtonSubmitWrapper>
        <button>Forgot your password?</button>
      </ButtonSubmitWrapper>
      </Link>
    </Container>
  );
}

export default LogIn;
