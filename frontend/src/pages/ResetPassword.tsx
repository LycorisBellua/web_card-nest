import { useState } from 'react';
import { Link } from 'react-router-dom';

function ResetPassword() {
  const [mail, setMail] = useState("")
  const [message, setMessage] = useState('');
  async function handlerSendCodeMsg(e: any) {
    e.preventDefault()
    if (!mail) {
      setMessage("Please enter your email address.")
      return
    }
    try {
      await fetch('api/send-reset-pwd-link', {
          method: "POST",
          headers: {
            "Content-Type" : "application/json"
          },
          body: JSON.stringify({mail})
      })
      setMessage(
      "If an account exists for this email address, you'll receive a " +
        'password reset link shortly...',
      )
    } catch(err: any) {
      setMessage(err.message)
    }
  }

  return (
    <div>
      <h1>Reset Password</h1>
      <form onSubmit={handlerSendCodeMsg}>
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" autoComplete="on"
          value={mail} 
          onChange={(e)=>setMail(e.target.value)}/>
        <button type="submit">Send code</button>
      </form>
      {message && <p>{message}</p>}
      <Link to="/login">Go back to login page 👈</Link>
    </div>
  );
}

export default ResetPassword;
