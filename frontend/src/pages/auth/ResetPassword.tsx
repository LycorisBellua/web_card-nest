import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { sanitizeEmail, sanitizePassword } from 'functions/UserSanitation';
import { validateEmail, validatePassword } from 'functions/UserValidation';
import { ScrollablePage } from 'components/general/Scrollable';
import { BtnDefault } from 'components/btn/Btn';
import InputField from 'components/misc/InputField';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  if (email && token) {
    return <ResetPasswordConfirm email={email} token={token} />;
  }
  return <ResetPasswordRequest />;
}

function ResetPasswordRequest() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  async function handlerLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) {
      setErrors(['Please fill all fields.']);
      return;
    }
    setErrors([]);
    setMessage('');
    const uEmail = sanitizeEmail(email);
    const allErrors = [...validateEmail(email)];
    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uemail: uEmail,
        }),
      });
      const data = (await res.json()) as { message: string };
      if (!res.ok) {
        setErrors([data.message]);
        return;
      }
      setMessage(
        "If an account exists for this email address, you'll receive a password reset link shortly...",
      );
      setEmail('');
      setErrors([]);
    } catch {
      setErrors(['Internal error']);
    }
  }

  return (
    <ScrollablePage>
      <h1>Reset Password</h1>
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          helpers={errors.length > 0 ? errors : [message]}
          isError={!!errors.length}
        />
        <BtnDefault type="submit">Send link</BtnDefault>
      </form>
      <Link to="/auth">Go back to login page</Link>
    </ScrollablePage>
  );
}

function ResetPasswordConfirm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const [message, setMessage] = useState('');
  const [uPwd, setUPwd] = useState('');
  const [uPwdConfirm, setUPwdConfirm] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setErrors([]);
    if (!uPwd || !uPwdConfirm) {
      setErrors(['Please fill all fields']);
      return;
    }
    if (uPwd !== uPwdConfirm) {
      setErrors(["Passwords don't match"]);
      return;
    }
    const userPwd = sanitizePassword(uPwd);
    const allErrors = validatePassword(userPwd, '', email);
    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token,
          newPassword: userPwd,
        }),
      });
      if (!res.ok) throw new Error('Password reset failed.');
      setMessage('Password reset successfully!');
      setUPwd('');
      setUPwdConfirm('');
      setErrors([]);
      setTimeout(() => {
        void navigate('/login');
      }, 3000);
    } catch {
      setErrors(['Error occured']);
    }
  }

  return (
    <ScrollablePage>
      <h1>Reset Password</h1>
      <p>Email: {email.length ? email : '[Error]'}</p>
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
      >
        <InputField
          id="new-password"
          type="password"
          name="new-password"
          label="New password"
          autoComplete="new-password"
          value={uPwd}
          onChange={(e) => setUPwd(e.target.value)}
          helpers={[
            'You need a minimum of 8 characters, including one uppercase, one lowercase, one digit and one special character.',
          ]}
          isError={!!errors.length}
        />
        <InputField
          id="confirm-password"
          type="password"
          name="confirm-password"
          label="Confirm new password"
          value={uPwdConfirm}
          onChange={(e) => setUPwdConfirm(e.target.value)}
          helpers={errors.length > 0 ? errors : [message]}
          isError={!!errors.length}
        />
        <BtnDefault>Confirm</BtnDefault>
      </form>
      <Link to="/auth">Go back to login page</Link>
    </ScrollablePage>
  );
}

export default ResetPassword;
