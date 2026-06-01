import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sanitizeEmail } from 'functions/UserSanitation';
import { validateEmail } from 'functions/UserValidation';
import { ScrollablePage } from 'components/general/Scrollable';
import { BtnDefault } from 'components/btn/Btn';
import InputField from 'components/misc/InputField';

function ResetPassword() {
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
        <BtnDefault type="submit">Send code</BtnDefault>
      </form>
      <Link to="/auth">Go back to login page</Link>
    </ScrollablePage>
  );
}

export default ResetPassword;
