import { useState } from "react";
import { useNavigate } from "react-router-dom";

type userData = {
	uname: string;
	uemail: string;
	upassword: string;
}

function SignUp() {
	const [uname, setUname] = useState("")
	const [uemail, setUEmail] = useState("")
	const [upassword, setUPassword] = useState("")
	const [upwdConfirm, setUPwdConfirm] = useState("")
	const [error, setError] = useState("")
	const [message, setMessage] = useState("")
	const navigate = useNavigate()

	async function handlerSubmit(e: any) {
		e.preventDefault()
		if (!uname || !uemail || !upassword || !upwdConfirm) {
			setError("Please fill all fields")
			return 
		}
		const reg = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
		if (!reg.test(upassword)) {
			setError("You need have 8 caracters minimum, includes one uppercase, one lowercase, one digit and one special caracter")
			return
		}
		if (upwdConfirm != upassword) {
			setError("Password not match")
			return
		}
		const idx: number = uemail.search('@')
		console.log(idx)
		if (idx != -1) {
			const mailExt:string = uemail.substring(idx + 1)
			if (upassword.search(mailExt) != -1) {
				setError("Password can not contain email address content")
				return 
			}
		}
		if (upassword.search(uname) != -1) {
			setError("Password can not contain user name")
			return 
		}
		setError("")
		const newUser: userData = {
			uname: uname,
			uemail: uemail,
			upassword: upassword,
		}
		try{
			const res = await fetch('https://jsonplaceholder.typicode.com/todos', {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(newUser)
			})
			const data = await res.json()
			console.log(data)
			if (!res.ok) {
				setError(data.message)
				return	
			}
			setMessage("Register success! Redirectin to placeholder...")
			setTimeout(()=>navigate('/placeholder'), 3000)
		} catch (err) {
			setError("Internal error")
		}

	}
	return (
		<div>
			<h1>Sign up</h1>
			<form onSubmit={handlerSubmit}>
				<div>
					<label htmlFor="u-name">User name
						<input id="u-name" type="text" value={uname} onChange={(e)=>setUname(e.target.value)}/>
					</label>
				</div>
				<div>
					<label htmlFor="u-email">Email
						<input id="u-email" type="email" value={uemail} onChange={(e)=>setUEmail(e.target.value)}/>
					</label>
				</div>
				<div>
					<label htmlFor="u-pwd">Password
						<input id="u-pwd" type="password" value={upassword} onChange={(e)=>setUPassword(e.target.value)}/>
					</label>
				</div>
				<div>
					<label htmlFor="u-pwd-cfm">Confirm your password  
						<input id="u-pwd-cfm" type="password" value={upwdConfirm} onChange={(e)=>setUPwdConfirm(e.target.value)}/>
					</label>
				</div>
				{error && <div style={{color : 'red'}}>{error}</div>}
				<button type="submit">Sign Up</button>
			</form>
			{message && <div style={{color: "green"}}>{message}</div>}
		</div>
	)
}

export default SignUp;
