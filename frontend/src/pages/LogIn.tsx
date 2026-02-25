import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

function LogIn() {
	const [logMail, setLogMail] = useState("")
	const [logPwd, setLogPwd] = useState("")
	const [error, setError] = useState("")
	const [message, setMessage] = useState("")
	const navigate = useNavigate()

	async function handlerLogin(e: any) {
		e.preventDefault()
		if (!logMail || !logPwd) {
			setError("Fields should not be empty")
			return 
		}
		try {
			const res = await fetch('https://jsonplaceholder.typicode.com/todos')
			const data = await res.json()
			if (!res.ok) {
				setError(data.massage)
				return
			}
			setMessage("Login success! Redirecting to placeholder...")
			setTimeout(()=>navigate('/placeholder'), 3000)
		} catch (err) {
			setError("Internal error")
		}
	}
	return (
		<div>
			<form onSubmit={handlerLogin}>
				<div>
					<label htmlFor='email'>Email address
						<input type="text" value={logMail} onChange={(e)=>setLogMail(e.target.value)}></input>
					</label>
				</div>
				<div>
					<label htmlFor='password'>Password
						<input id="password" type="password" value={logPwd} onChange={(e)=>setLogPwd(e.target.value)}></input>
					</label>
				</div>
				<button type="submit">Login</button>
			</form>
			{error && <div style={{color:'red'}}>{error}</div>}
			{message && <div style={{color:'green'}}>{message}</div>}
			<Link to='/reset-pwd'>
				<button>Reset a password ?</button>
			</Link>
		</div>
	)
}

export default LogIn