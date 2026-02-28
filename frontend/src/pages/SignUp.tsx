import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handlerSubmit(e: any) {
    e.preventDefault();
    if (!uname || !uemail || !upassword || !upwdConfirm) {
      setError('Please fill all fields');
      return;
    }
    const reg = new RegExp(
      '^(?=.*[A-Z])' +
        '(?=.*[a-z])' +
        '(?=.*\\d)' +
        '(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?])' +
        '.{8,}$',
    );
    if (!reg.test(upassword)) {
      setError(
        'You need a minimum of 8 characters, including one uppercase, ' +
          'one lowercase, one digit and one special character',
      );
      return;
    }
    if (upwdConfirm != upassword) {
      setError("Passwords don't match");
      return;
    }
    const idx: number = uemail.search('@');
    if (idx != -1) {
      const mailExt: string = uemail.substring(idx + 1);
      if (upassword.search(mailExt) != -1) {
        setError('The password cannot contain the email address');
        return;
      }
    }
    if (upassword.search(uname) != -1) {
      setError('The password cannot contain the username');
      return;
    }
    setError('');
    const newUser: userData = {
      uname: uname,
      uemail: uemail,
      upassword: upassword,
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
      setError('Internal error');
    }
  }

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handlerSubmit}>
        <div>
          <label htmlFor="u-name">
            Username
            <input
              id="u-name"
              type="text"
              value={uname}
              onChange={(e) => setUname(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="u-email">
            Email
            <input
              id="u-email"
              type="email"
              value={uemail}
              onChange={(e) => setUEmail(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="u-pwd">
            Password
            <input
              id="u-pwd"
              type="password"
              value={upassword}
              onChange={(e) => setUPassword(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="u-pwd-cfm">
            Confirm your password
            <input
              id="u-pwd-cfm"
              type="password"
              value={upwdConfirm}
              onChange={(e) => setUPwdConfirm(e.target.value)}
            />
          </label>
        </div>
        {error && <div>{error}</div>}
        <button type="submit">Sign Up</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
}

export default SignUp;
