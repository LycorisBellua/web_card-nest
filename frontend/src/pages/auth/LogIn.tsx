import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from 'context/useUser';
import { FetchSelfRequest } from 'functions/Requests';
import { sanitizeEmail, sanitizePassword } from 'functions/UserSanitation';
import { validateEmail } from 'functions/UserValidation';
import { BtnDefault } from 'components/btn/Btn';
import InputField from 'components/misc/InputField';

function LogIn() {
  const { setUser, setFriends, setBlocked } = useUser();
  const [logMail, setLogMail] = useState('');
  const [logPwd, setLogPwd] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handlerLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!logMail || !logPwd) {
      setErrors(['Please fill all fields.']);
      return;
    }
    setErrors([]);
    setMessage('');
    const loginEmail = sanitizeEmail(logMail);
    const loginPwd = sanitizePassword(logPwd);
    const allErrors = [...validateEmail(loginEmail)];
    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPwd,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as {
          message: string;
          error: string;
          statusCode: number;
        };
        setErrors([data.message]);
        return;
      }
      const dataLogin = (await res.json()) as { accessToken: string };
      const dataSelf = await FetchSelfRequest(dataLogin.accessToken);
      setUser(dataSelf.user);
      setFriends(dataSelf.friends);
      setBlocked(dataSelf.blocked);
      if (!dataSelf.user) {
        setErrors(['Internal error']);
      } else {
        setMessage('Login success! Redirecting to your profile...');
        setLogMail('');
        setLogPwd('');
        setErrors([]);
        await navigate('/profile');
      }
    } catch {
      setErrors(['Internal error']);
    }
  }

  return (
    <>
      <h1>Log In</h1>
      <form
        onSubmit={(e) => {
          void handlerLogin(e);
        }}
      >
        <InputField
          id="email"
          type="email"
          name="email"
          label="Email"
          autoComplete="on"
          value={logMail}
          onChange={(e) => setLogMail(e.target.value)}
          isError={!!errors.length}
        />
        <InputField
          id="password"
          type="password"
          name="password"
          label="Password"
          autoComplete="on"
          value={logPwd}
          onChange={(e) => setLogPwd(e.target.value)}
          helpers={errors.length > 0 ? errors : [message]}
          isError={!!errors.length}
        />
        <BtnDefault type="submit">Log In</BtnDefault>
      </form>
      <Link to="/reset-pwd">
        <BtnDefault>Forgot your password?</BtnDefault>
      </Link>
    </>
  );
}

export default LogIn;
