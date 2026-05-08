import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import BtnDefault from 'components/btn/BtnDefault';
import InputField from 'components/misc/InputField';

function SignUp() {
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
      const res = await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uname: username,
          uemail: email,
          upassword: password,
        }),
      });
      const data = (await res.json()) as { message: string };
      if (!res.ok) {
        setError([data.message]);
        return;
      }
      setMessage(
        "You've signed up successfully! Redirecting to your profile...",
      );
      setTimeout(() => {
        void navigate('/profile');
      }, 3000);
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
          helpers={[
            'The password needs a minimum of 8 characters, including one uppercase, one lowercase, one digit and one special character.',
          ]}
          isError={!!errors.length}
        />
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
