import { Link } from 'react-router-dom'

function ResetPassword() {
	return (
		<div>
			<div>
				<label htmlFor="email"> Email address
					<input id="email" type="email" />
				</label>
				<button type='submit'>Send code</button>
			</div>
			<p>If an account exists for this email address, you'll receive a password reset link shortly...</p>
			<Link to='/login' style={{textDecoration: 'none'}}>Go back to login page 👈🏼</Link>
		</div>
	)
}

export default ResetPassword;