import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'context/useUser';
import { FetchSelfRequest } from 'functions/Requests';
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
import { BtnDefault } from 'components/btn/Btn';
import InputField from 'components/misc/InputField';
import styled from 'styled-components';

const Helper = styled.p`
  font-size: 0.68rem;
  color: #7a5c42;
`;

function SignUp() {
  const {
    setUser,
    setBlocked,
    setFriends,
    setSentFriends,
    setReceivedFriends,
  } = useUser();
  const [uname, setUname] = useState('');
  const [uemail, setUEmail] = useState('');
  const [upassword, setUPassword] = useState('');
  const [upwdConfirm, setUPwdConfirm] = useState('');
  const [errors, setError] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handlerSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    setError(allErrors);
    if (allErrors.length > 0) {
      return;
    }
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email_unverified: email,
          password: password,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as {
          message: string;
          error: string;
          statusCode: number;
        };
        setError([data.message]);
        return;
      }
      const dataSignup = (await res.json()) as { accessToken: string };
      const dataSelf = await FetchSelfRequest(dataSignup.accessToken);
      setUser(dataSelf.user);
      setBlocked(dataSelf.blocked);
      setFriends(dataSelf.friends);
      setSentFriends(dataSelf.sentFriends);
      setReceivedFriends(dataSelf.receivedFriends);
      if (!dataSelf.user) {
        setError(['Internal error.']);
      } else {
        setMessage(
          "You've signed up successfully! Redirecting to your profile...",
        );
        await navigate('/profile');
      }
    } catch {
      setError(['Internal error.']);
    }
  }

  return (
    <>
      <h1>Sign Up</h1>
      <form
        onSubmit={(e) => {
          void handlerSubmit(e);
        }}
      >
        <InputField
          id="u-name"
          type="text"
          name="u-name"
          label="Username"
          value={uname}
          onChange={(e) => setUname(e.target.value)}
          isError={!!errors.length}
        />
        <InputField
          id="u-email"
          type="email"
          name="u-email"
          label="Email"
          value={uemail}
          onChange={(e) => setUEmail(e.target.value)}
          isError={!!errors.length}
        />
        <InputField
          id="u-pwd"
          type="password"
          name="u-pwd"
          label="Password"
          value={upassword}
          onChange={(e) => setUPassword(e.target.value)}
          isError={!!errors.length}
        />
        <Helper>
          The password needs between 8 and 64 characters, including one
          uppercase, one lowercase, one digit and one special character.
        </Helper>
        <InputField
          id="u-pwd-cfm"
          type="password"
          name="u-pwd-cfm"
          label="Confirm password"
          value={upwdConfirm}
          onChange={(e) => setUPwdConfirm(e.target.value)}
          helpers={errors.length > 0 ? errors : [message]}
          isError={!!errors.length}
        />
        <BtnDefault type="submit">Sign Up</BtnDefault>
      </form>
    </>
  );
}

export default SignUp;
