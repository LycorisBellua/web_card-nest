import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LogIn() {
  const [logMail, setLogMail] = useState('');
  const [logPwd, setLogPwd] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handlerLogin(e: any) {
    e.preventDefault();
    if (!logMail || !logPwd) {
      setError('Fields should not be empty');
      return;
    }
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos');
      const data = await res.json();
      if (!res.ok) {
        setError(data.massage);
        return;
      }
      setMessage('Login success! Redirecting to placeholder...');
      setTimeout(() => navigate('/placeholder'), 3000);
    } catch (err) {
      setError('Internal error');
    }
  }

  return (
    <div>
      <h1>Log In</h1>
      <form onSubmit={handlerLogin}>
        <div>
          <label htmlFor="email">
            Email address
            <input
              id="email"
              type="text"
              autoComplete="on"
              value={logMail}
              onChange={(e) => setLogMail(e.target.value)}
            ></input>
          </label>
        </div>
        <div>
          <label htmlFor="password">
            Password
            <input
              id="password"
              type="password"
              autoComplete="on"
              value={logPwd}
              onChange={(e) => setLogPwd(e.target.value)}
            ></input>
          </label>
        </div>
        <button type="submit">Log In</button>
      </form>
      {error && <div>{error}</div>}
      {message && <div>{message}</div>}
      <Link to="/reset-pwd">
        <button>Forgot your password?</button>
      </Link>
    </div>
  );
}

export default LogIn;
