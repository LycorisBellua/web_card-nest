import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Container, FormGroup, ErrorText, ButtonSubmitWrapper, SuccessMsg} from 'components/style/SignUp';

type userData = {
  uname: string;
  uemail: string;
  upassword: string;
};

function passwordErrors(uname: string, upassword: string, uemail: string) : string[] {
  let errors : string[] = []
  if (upassword.length < 8)
    errors.push("Must have at least 8 character.")
  if (!/[A-Z]/.test(upassword))
    errors.push("Must have at least 1 uppercase letter.")
  if (!/[a-z]/.test(upassword))
    errors.push("Must have at least 1 lowercase letter.")
  if (!/\d/.test(upassword))
    errors.push("Must have at least 1 digit.")
  if (!/[!@#$%^&*()_+\-=\[\]{};':"|,.<>/?]/.test(upassword))
    errors.push("Must have at least 1 symbol.")
  if (upassword.includes(uname))
    errors.push('The password cannot contain the username');
  const idx: number = uemail.search('@');
  if (idx != -1) {
    const mailExt: string = uemail.substring(idx + 1);
    if (upassword.search(mailExt) != -1) {
      errors.push('The password cannot contain the email address');
    }
  }
  return errors
}

function sanitizePassword(upassword: string) : string {
  let pwd= upassword.replace(/[\x00-\x1F\x7F]/g, "")
  if (upassword.length > 128)
    pwd = pwd.slice(0, 128)
  return pwd
}

function emailErrors(uemail:string) : string[] {
  let errors : string[] = []
  if (!uemail.includes("@") || /[\x00-\x1F\x7F]/.test(uemail)) { 
    errors.push("Must be a valid email address.")
    return errors
  }
  const parts = uemail.split("@")
  if (parts.length < 2) {
    errors.push("Must be a valid email address.")
    return errors
  }
  const [local, domain] = parts
  if(local.startsWith(".") || local.endsWith(".") || local.includes(".."))
    errors.push("Local part cannot start, end, or have consecutive dots.")
  const illegalChar = /[&='",<>\\{}\[\]!#$%*+/?^|~]/
  if (illegalChar.test(local) || /[@&='",<>\\!#$%*+/?^|~]/.test(domain))
    errors.push("Email address contains invalid characters.")
  if (!/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(domain))
    errors.push("Domain part is invalid.")
  return errors
}

function SignUp() {
  const [uname, setUname] = useState('');
  const [uemail, setUEmail] = useState('');
  const [upassword, setUPassword] = useState('');
  const [upwdConfirm, setUPwdConfirm] = useState('');
  const [errors, setError] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handlerSubmit(e: any) {
    e.preventDefault();
    if (!uname || !uemail || !upassword || !upwdConfirm) {
      setError(['Please fill all fields.']);
      return;
    }
    const username = uname.trim().replace(/[\x00-\x1F\x7F]/g, "").replace(/\s+/g, " ")
    if (username.length > 20){
      setError(["Your need a maximum of 20 characters for your username."])
      return
    }
    const userEmail = uemail.trim()
    const emailErr = emailErrors(userEmail)
    if (emailErr.length > 0) {
      setError(emailErr)
      return
    }
    const pwdErr = passwordErrors(username, upassword, userEmail)
    if (pwdErr.length > 0) {
      setError(pwdErr)
      return
    }
    if (upwdConfirm != upassword) {
      setError(["Passwords don't match."]);
      return;
    }
    const userpassword = sanitizePassword(upassword)
    setError([]);
    const newUser: userData = {
      uname: username,
      uemail: userEmail,
      upassword: userpassword,
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
      setError(['Internal error.']);
    }
  }

  return (
    <Container>
      <h1>Sign Up</h1>
      <form onSubmit={handlerSubmit}>
          <FormGroup>
            <label htmlFor="u-name">Username</label>
            <input
              id="u-name"
              type="text"
              value={uname}
              onChange={(e) => setUname(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="u-email">Email</label>
            <input
              id="u-email"
              type="email"
              value={uemail}
              onChange={(e) => setUEmail(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="u-pwd">Password</label>
            <input
              id="u-pwd"
              type="password"
              value={upassword}
              onChange={(e) => setUPassword(e.target.value)}
            />
            <p>You need a minimum of 8 characters, including one uppercase, one lowercase, one digit and one special character</p>
          </FormGroup>
          <FormGroup>
            <label htmlFor="u-pwd-cfm">Confirm your password</label>
            <input
              id="u-pwd-cfm"
              type="password"
              value={upwdConfirm}
              onChange={(e) => setUPwdConfirm(e.target.value)}
            />
          </FormGroup>
          <ErrorText>
            {errors.length > 0 && errors.map((err, i)=><p key={i}>{err}</p>)}
          </ErrorText>
          <ButtonSubmitWrapper>
            <button type="submit">Sign Up</button> 
          </ButtonSubmitWrapper>
      {message && <SuccessMsg>{message}</SuccessMsg>}
      </form>
    </Container>
  );
}

export default SignUp;
