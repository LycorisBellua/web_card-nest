import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {sanitizePassword} from 'functions/UserSanitation';
import {validatePassword} from 'functions/UserValidation';
import {
  Container,
  FormGroup,
  ErrorText,
  ButtonSubmitWrapper,
  SuccessMsg,
} from 'components/style/SignForm';

function	ResetPasswordSecond() {
	const [searchParams] = useSearchParams()
	const token = searchParams.get("token")
	const [email, setEmail] = useState("")
	const [username, setUsername] = useState("")
	const [message, setMessage] = useState("")
	const [uPwd, setUPwd] = useState("")
	const [uPwdConfirm, setUPwdConfirm] = useState("")
	const [errors, setErrors] = useState<string[]>([])
	const navigate = useNavigate()

	useEffect(()=>{
		async function fetchUserData() {
			if (!token) {
				setErrors(["Invalid reset lnk."])
				return 
			}
			try {
				const res = await fetch('/api/verify-reset-token', {
					method: "POST",
					headers: {"Content-Type" : "application/json"},
					body: JSON.stringify({token})
				})
				if (!res.ok) {
					setErrors(["Link is expired."])
					return
				}
				const data = await res.json()
				setEmail(data.email)
				setUsername(data.username)
			} catch {
				setErrors(["Internal error."])
			}
		}
		fetchUserData()
	}, [token])

	async function handleSubmit(e: any) {
		e.preventDefault()
		setMessage("")
		setErrors([])
		if (!uPwd || !uPwdConfirm) {
			setErrors(["Please fill all fields"])
			return
		}
		
		if (!token) {
			setErrors(["Invalid reset link."])
			return
		}
		if (uPwd !== uPwdConfirm) {
			setErrors(["Passwords don't match"]);
			return;
		}
		const userPwd = sanitizePassword(uPwd)
		const allErrors = validatePassword(userPwd, username, email)
		if (allErrors.length > 0) {
			setErrors(allErrors)
			return
		}
		try {
			const res = await fetch("/api/reset-password", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					token, 
					newPassword: userPwd})
			})
			if (!res.ok)
				throw new Error("Password reset failed.")
			setMessage("Password reset successfully!")
			setUPwd("")
			setUPwdConfirm("")
			setErrors([])
			setTimeout(() => {navigate('/login')}, 3000);
		} catch {
			setErrors(["Error occured"])
		}
	}

	return (
		<Container>
			<h1>Reset a new password</h1>
			<p>Email: {email}</p>
			<form onSubmit={handleSubmit}>
				<FormGroup>
					<label>Please enter a new password</label>
					<input type="password" value={uPwd} onChange={e=>setUPwd(e.target.value)}/>
					<p>You need a minimum of 8 characters, including one uppercase, one lowercase, one digit and one special character</p>
				</FormGroup>
				<FormGroup>
					<label>Confirm password</label>
					<input type="password" value={uPwdConfirm} onChange={e=>setUPwdConfirm(e.target.value)}/>
				</FormGroup>
				<ErrorText>
					{errors.length > 0 && errors.map((err, i)=><p key={i}>{err}</p>)}
				</ErrorText>
				<ButtonSubmitWrapper>
					<button>Confirm</button>
				</ButtonSubmitWrapper>
			</form>
			{message && <SuccessMsg>{message}</SuccessMsg>}
			<Link to="/login">Go back to login page 👈</Link>
		</Container>
	)
}

export default ResetPasswordSecond;