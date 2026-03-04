import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function	ResetPasswordSecond() {
	const [searchParams] = useSearchParams()
	const token = searchParams.get("token")
	const [email, setEmail] = useState("")
	const [message, setMessage] = useState("")
	const [uPwd, setUPwd] = useState("")
	const [uPwdConfirm, setUPwdConfirm] = useState("")
	const [errors, setErrors] = useState<string[]>([])

	useEffect(()=>{
		async function fetchEmail() {
			if (!token) {
				setErrors(["Invalid reset lnk."])
				return 
			}
			try {
				const res = await fetch(`/api/token-from-email?token=${token}`)
				if (!res.ok) {
					setErrors(["Link is expired."])
					return
				}
				const data = await res.json()
				setEmail(data.email)
			} catch {
				setErrors(["Internal error."])
			}
		}
		fetchEmail()
	}, [token])

	async function handleSubmit(e: any) {
		e.preventDefault()
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
		try {
			const res = await fetch("/api/reset-password", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({token, uPwd})
			})
			if (!res.ok)
				throw new Error("Password reset failed.")
			setMessage("Password reset successfully!")
			setUPwd("")
			setUPwdConfirm("")
			setErrors([])
		} catch {
			setErrors(["Error occured"])
		}
	}

	return (
		<div>
			<h1>Reset a new password</h1>
			<p>Email: {email}</p>
			<form onSubmit={handleSubmit}>
				<div>
					<label>New password</label>
					<input type="password" value={uPwd} onChange={e=>setUPwd(e.target.value)}/>
					<p>You need a minimum of 8 characters, including one uppercase, one lowercase, one digit and one special character</p>
				</div>
				<div>
					<label>Confirm password</label>
					<input type="password" value={uPwdConfirm} onChange={e=>setUPwdConfirm(e.target.value)}/>
				</div>
			{errors.length > 0 && errors.map((err, i)=><p key={i}>{err}</p>)}
			<button>Confirm</button>
			</form>
			{message && <p>{message}</p>}
			<Link to="/login">Go back to login page 👈</Link>
		</div>
	)
}

export default ResetPasswordSecond;