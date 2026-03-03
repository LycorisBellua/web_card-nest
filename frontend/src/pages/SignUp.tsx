import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  FormGroup,
  ErrorText,
  ButtonSubmitWrapper,
  SuccessMsg,
} from 'components/style/SignUp';
import {
  sanitizeUsername,
  sanitizeEmail,
  sanitizePassword,
} from 'functions/UserSanitation';
import {
  validateUsername,
  validateEmail,
  validatePassword,
} from 'functions/UserValidation';

type userData = {
  uname: string;
  uemail: string;
  upassword: string;
};

function SignUp() {
  const [uname, setUname] = useState('');
  const [uemail, setUEmail] = useState('');
  const [upassword, setUPassword] = useState('');
  const [upwdConfirm, setUPwdConfirm] = useState('');
  const [errors, setError] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handlerSubmit(e: any) {
    e.preventDefault();
    if (!uname || !uemail || !upassword || !upwdConfirm) {
      setError(['Please fill all fields.']);
      return;
    }
    const username = sanitizeUsername(uname);
    const email = sanitizeEmail(uemail);
    const password = sanitizePassword(upassword);
    const passwordConfirm = sanitizePassword(upwdConfirm);
    const allErrors = [
      ...validateUsername(username),
      ...validateEmail(email),
      ...validatePassword(password, username, email),
      ...(password != passwordConfirm ? ["Passwords don't match."] : []),
    ];
    if (allErrors.length > 0) {
      setError(allErrors);
      return;
    }
    setError([]);
    const newUser: userData = {
      uname: username,
      uemail: email,
      upassword: password,
    };
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setMessage(
        "You've signed up successfully! Redirecting to " + 'placeholder...',
      );
      setTimeout(() => navigate('/placeholder'), 3000);
    } catch (err) {
      setError(['Internal error.']);
    }
  }

  return (
    <Container>
      <h1>Sign Up</h1>
      <form onSubmit={handlerSubmit}>
        <FormGroup>
          <label htmlFor="u-name">Username</label>
          <input
            id="u-name"
            type="text"
            value={uname}
            onChange={(e) => setUname(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <label htmlFor="u-email">Email</label>
          <input
            id="u-email"
            type="email"
            value={uemail}
            onChange={(e) => setUEmail(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <label htmlFor="u-pwd">Password</label>
          <input
            id="u-pwd"
            type="password"
            value={upassword}
            onChange={(e) => setUPassword(e.target.value)}
          />
          <p>
            The password needs a minimum of 8 characters, including one
            uppercase, one lowercase, one digit and one special character.
          </p>
        </FormGroup>
        <FormGroup>
          <label htmlFor="u-pwd-cfm">Confirm your password</label>
          <input
            id="u-pwd-cfm"
            type="password"
            value={upwdConfirm}
            onChange={(e) => setUPwdConfirm(e.target.value)}
          />
        </FormGroup>
        <ErrorText>
          {errors.length > 0 && errors.map((err, i) => <p key={i}>{err}</p>)}
        </ErrorText>
        <ButtonSubmitWrapper>
          <button type="submit">Sign Up</button>
        </ButtonSubmitWrapper>
        {message && <SuccessMsg>{message}</SuccessMsg>}
      </form>
    </Container>
  );
}

export default SignUp;
