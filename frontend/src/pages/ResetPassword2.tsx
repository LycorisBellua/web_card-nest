import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
<<<<<<< HEAD:frontend/src/pages/ResetPassword2.tsx
import {
  Container,
  FormGroup,
  ErrorText,
  ButtonSubmitWrapper,
  SuccessMsg,
} from 'components/style/SignForm';
import { sanitizePassword } from 'functions/UserSanitation';
import { validatePassword } from 'functions/UserValidation';
=======
import { sanitizePassword } from 'functions/UserSanitation';
import { validatePassword } from 'functions/UserValidation';
import { ScrollablePage } from 'components/general/Scrollable';
import { BtnDefault } from 'components/btn/Btn';
import InputField from 'components/misc/InputField';
>>>>>>> parent of 6076e3e ([Frontend] Connect to backend (#94)):frontend/src/pages/auth/ResetPassword2.tsx

function ResetPasswordSecond() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [uPwd, setUPwd] = useState('');
  const [uPwdConfirm, setUPwdConfirm] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserData() {
      if (!token) {
        setErrors(['Invalid reset link.']);
        return;
      }
      try {
        const res = await fetch('/api/verify-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          setErrors(['Link is expired.']);
          return;
        }
        const data = (await res.json()) as { email: string; username: string };
        setEmail(data.email);
        setUsername(data.username);
      } catch {
        setErrors(['Internal error.']);
      }
    }
    void fetchUserData();
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setErrors([]);
    if (!uPwd || !uPwdConfirm) {
      setErrors(['Please fill all fields']);
      return;
    }

    if (!token) {
      setErrors(['Invalid reset link.']);
      return;
    }
    if (uPwd !== uPwdConfirm) {
      setErrors(["Passwords don't match"]);
      return;
    }
    const userPwd = sanitizePassword(uPwd);
    const allErrors = validatePassword(userPwd, username, email);
    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
<<<<<<< HEAD:frontend/src/pages/ResetPassword2.tsx
    <Container>
      <h1>Reset a new password</h1>
      <p>Email: {email}</p>
=======
    <ScrollablePage>
      <h1>Reset a new password</h1>
      <p>Email: {email.length ? email : '[Error]'}</p>
>>>>>>> parent of 6076e3e ([Frontend] Connect to backend (#94)):frontend/src/pages/auth/ResetPassword2.tsx
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
      >
<<<<<<< HEAD:frontend/src/pages/ResetPassword2.tsx
        <FormGroup>
          <label htmlFor="new-password">Please enter a new password</label>
          <input
            id="new-password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            value={uPwd}
            onChange={(e) => setUPwd(e.target.value)}
          />
          <p>
            You need a minimum of 8 characters, including one uppercase, one
            lowercase, one digit and one special character
          </p>
        </FormGroup>
        <FormGroup>
          <label htmlFor="confirm-password">Confirm password</label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            value={uPwdConfirm}
            onChange={(e) => setUPwdConfirm(e.target.value)}
          />
        </FormGroup>
        <ErrorText>
          {errors.length > 0 && errors.map((err, i) => <p key={i}>{err}</p>)}
        </ErrorText>
        <ButtonSubmitWrapper>
          <button>Confirm</button>
        </ButtonSubmitWrapper>
      </form>
      {message && <SuccessMsg>{message}</SuccessMsg>}
      <Link to="/login">Go back to login page 👈</Link>
    </Container>
=======
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
>>>>>>> parent of 6076e3e ([Frontend] Connect to backend (#94)):frontend/src/pages/auth/ResetPassword2.tsx
  );
}

export default ResetPasswordSecond;
