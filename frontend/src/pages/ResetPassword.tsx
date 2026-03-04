import { useState } from 'react';
import { Link } from 'react-router-dom';
import {sanitizeEmail} from 'functions/UserSanitation';
import {validateEmail} from 'functions/UserValidation';
import {
  Container,
  FormGroup,
  ErrorText,
  ButtonSubmitWrapper,
  SuccessMsg,
} from 'components/style/SignForm';

function ResetPassword() {
  const [mail, setMail] = useState("")
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([])

  async function handlerSendCodeMsg(e: any) {
    e.preventDefault()
    if (!mail) {
      setErrors(["Please enter your email address."])
      return
    }
    setErrors([])
    const userEmail = sanitizeEmail(mail)
    const allErrors = validateEmail(userEmail)
    if (allErrors.length > 0) {
      setErrors(allErrors)
      return
    }
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
          method: "POST",
          headers: {
            "Content-Type" : "application/json"
          },
          body: JSON.stringify({email: userEmail})
      })
      const data = await res.json()
      if (!res.ok) {
        console.log(data.message)
        setErrors([data.message])
      }
      setMessage(
      "If an account exists for this email address, you'll receive a " +
        'password reset link shortly...',
      )
    } catch {
      setErrors(["Internal error"])
    }
  }

  return (
    <Container>
      <h1>Reset Password</h1>
      <form onSubmit={handlerSendCodeMsg}>
        <FormGroup>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="on"
            value={mail} 
            onChange={(e)=>setMail(e.target.value)}/>
        </FormGroup>
        <ErrorText>
          {errors && errors.map((err, i)=><p key={i}>{err}</p>)}
        </ErrorText>
        <ButtonSubmitWrapper>
          <button type="submit">Send code</button>
        </ButtonSubmitWrapper>
      </form>
      {message && <SuccessMsg>{message}</SuccessMsg>}
      <Link to="/login">Go back to login page 👈</Link>
    </Container>
  );
}

export default ResetPassword;
