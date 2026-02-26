import { useState } from 'react';
import { Link } from 'react-router-dom'

function ResetPassword() {
	const [message, setMessage] = useState("")
	function handlerSendCodeMsg() {
		setMessage("If an account exists for this email address, you'll receive a password reset link shortly...")
	}
	return (
		<div>
			<div>
				<label htmlFor="email"> Email address
					<input id="email" type="email" />
				</label>
				<button type='submit' onClick={handlerSendCodeMsg}>Send code</button>
			</div>
			{message && <p>{message}</p>}
			<Link to='/login'>Go back to login page 👈🏼</Link>
		</div>
	)
}

export default ResetPassword;