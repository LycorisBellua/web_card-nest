import styled from 'styled-components'
import userAvatar from 'assets/default_user.png'
import { useEffect, useState } from 'react';

const Page = styled.div`
	width: 80%;
	p {
		margin: 4px
	}
`;

const UserInfoStyles = styled.div`
	background-color: #542C0E;
	padding: 20px;
	border-radius: 10px;
	margin: auto;
	h2 {
		margin: 4px
	}

`;

const UserAvatarStyle = styled.div`
	position: relative;
	display: flex;
	justify-content: center;
	img {
		max-width: 100px;
		max-height: 100px;
		object-fit: cover;
	}
	button {
		position: absolute;
	}
`;

const InfoRow = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 4px;
	gap: 10px;
	input {
		flex: 1;
	}
	button {
		border: none;
		border-radius: 8px;
	}
`;

const DescriptionTextarea = styled.div`
	p {
		max-width: 100%;
		word-wrap: break-word;
		white-space: pre-wrap;
	}
	textarea {
		width: 100%;
		box-sizing: border-box;
		border: none;
	}
`;

type User = {
	id: string | number;
	username: string;
	email: string;
	unverifiedEmail: string;
	rank: string;
	description: string;
	avatarURL: string;
	registred: string;
}

function Profile() {
	const [user, setUser] = useState<User | null>(null)
	const [errors, setErrors] = useState<string[]>([])
	
	useEffect(()=>{
		async function fetchUser() {
			try{
				const res = await fetch("https://jsonplaceholder.typicode.com/users/1", {
					credentials: "include"
				})
				const data = await res.json()
				if (!res.ok) {
					setErrors([`Error ${res.status}: ${res.statusText}`])
					return 
				}
				console.log(data)
				setUser(data)
			} catch (err) {
				setErrors(["Network error, please try again."])
			}
		}
		fetchUser()
	}, [])

	async function updateUserField(field: keyof User, value: any) {
		if (!value) return
		await fetch('https://jsonplaceholder.typicode.com/posts/1', {
			method: 'PATCH',
			headers: {"Content-type" : "application/json"},
			body: JSON.stringify({[field]: value})
		})
		setUser(old=>({...old!, [field]: value}))
	}

	return (
		<Page>
			{errors.length > 0 && <p>{errors}</p>}
			<UserInfo user={user} OnUpdateUserField={updateUserField} />
		</Page>
	)
}

type UserInfoProps = {
	user: User | null;
	OnUpdateUserField: (field: keyof User, value: any)=>Promise<void>;
}

function UserInfo({user, OnUpdateUserField} : UserInfoProps) {
	if (!user) return
	const {username, email, unverifiedEmail, rank, description, avatarURL, registred} = user
	return (
		<UserInfoStyles>
			<UserAvatarStyle>
				<img src={avatarURL? avatarURL : userAvatar} alt='avatar' />
				<button>Edit🖊️​</button>
			</UserAvatarStyle>
			<div>
				<UpdateUsername username={username} OnUpdateUserField={OnUpdateUserField}/>
				<InfoRow>
					<p>Rank: {rank}</p>
				</InfoRow>
				<InfoRow>
					<p>Registre date: {registred}</p>
				</InfoRow>
				<UpdateUserEmail email={email} OnUpdateUserField={OnUpdateUserField} />
				{!unverifiedEmail && <VerifyEmail unverifiedEmail={unverifiedEmail} />}
				<UpdateUserDescription description={description} OnUpdateUserField={OnUpdateUserField}/>

			</div>
		</UserInfoStyles>
	)
}

type UpdateUsernameProps = {
	username: string;
	OnUpdateUserField: (field: keyof User, value: any)=>Promise<void>;
}

function UpdateUsername({username, OnUpdateUserField} : UpdateUsernameProps) {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState("")

	async function handleSaving() {
		await OnUpdateUserField("username", value)
		setEdit(false)
	}

	return (
		<InfoRow>
			<p>Username: {edit? <input type="text" value={value} onChange={e=>setValue(e.target.value)}/> : username}</p>
			<button onClick={edit? handleSaving : ()=>setEdit(true)}>{edit? "save" : "🖊️"}</button>
		</InfoRow>
	)
}

type UpdateUserEmailProps = {
	email: string;
	OnUpdateUserField: (field: keyof User, value: any)=>Promise<void>;
}

function UpdateUserEmail({email, OnUpdateUserField} : UpdateUserEmailProps) {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState("")

	async function handleSaving() {
		await OnUpdateUserField("email", value)
		setEdit(false)
	}

	return (
		<InfoRow>
			<p>Email: {edit? 
				<input type='email'
					value={value}
					onChange={e=>setValue(e.target.value)}/>
					: email}</p>
			<button onClick={edit? handleSaving : ()=>setEdit(true)}>{edit? "save" : "🖊️"}</button>
		</InfoRow>
	)
}

function VerifyEmail({unverifiedEmail} : {unverifiedEmail : string}) {
	const [message, setMessage] = useState("")
	async function handleVerifyEmail() {
		try {
			const res = await fetch('https://jsonplaceholder.typicode.com/todos', {
				method: "POST",
				headers: {"Content-type" : "application/json"},
				body: JSON.stringify({unverifiedEmail: unverifiedEmail})
			})
			if (!res.ok) {
				setMessage(`Error ${res.status} : ${res.statusText}`)
				return
			}
			setMessage("You will receive shortly a confirmation by email.")
		} catch (err) {
			setMessage("Error occured")
		}
	}

	return (
		<div>
			<InfoRow>
				<p>Unverified email : {unverifiedEmail}</p>
				<button onClick={handleVerifyEmail}>verify🖊️</button>
			</InfoRow>
			{message && <p style={{marginLeft: "20px", fontSize: '12px'}}>{message}</p>}
		</div>
	)
}

type UpdateUserDescription = {
	description: string;
	OnUpdateUserField: (field: keyof User, value: any)=>Promise<void>;
}

function UpdateUserDescription({description, OnUpdateUserField} : UpdateUserDescription) {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState("")

	async function handleSaving() {
		await OnUpdateUserField("description", value)
		setEdit(false)
		setValue("")
	}

	return (
		<div>
			<InfoRow>
				<p>Description:</p>
				<button onClick={edit? handleSaving : ()=>setEdit(true)}>{edit? "save" : "🖊️"}</button>
			</InfoRow>
			<DescriptionTextarea>
				{edit? <textarea 
						name="user-description"
						id="user-description"
						maxLength={200}
						rows={4}
						wrap='soft' 
						value={value}
						onChange={e=>setValue(e.target.value)}
						></textarea>
				: <p>{description}</p>}
			</DescriptionTextarea>
		</div>
	)
}

export default Profile