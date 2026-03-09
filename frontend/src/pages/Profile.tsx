import userAvatar from 'assets/default_user.png'
import React, { useEffect, useRef, useState } from 'react';
import {
	Page,
	ProfileErrorText,
	UserInfoStyles,
	UserAvatarStyle,
	InfoRow,
	DescriptionTextarea,
} from 'components/style/ProfileStyle';
import {ErrorText} from 'components/style/SignForm';
import {
  sanitizeUsername,
  sanitizeEmail,
} from 'functions/UserSanitation';
import {
  validateUsername,
  validateEmail,
} from 'functions/UserValidation';

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
				const res = await fetch("http://localhost:3001/users/1", {
					credentials: "include"
				})
				if (!res.ok) {
					setErrors([`Error ${res.status}: ${res.statusText}`])
					return 
				}
				const data = await res.json()
				setUser(data)
			} catch (err) {
				setErrors(["Network error, please try again."])
			}
		}
		fetchUser()
	}, [])

	async function updateUserField(field: keyof User, value: any) {
		if (!value) return
		await fetch('http://localhost:3001/users/1', {
			method: 'PATCH',
			headers: {"Content-type" : "application/json"},
			body: JSON.stringify({[field]: value})
		})
		setUser(old=>({...old!, [field]: value}))
	}

	return (
		<Page>
			<UserInfo user={user} OnUpdateUserField={updateUserField} />
			{errors.length > 0 && <ErrorText>{errors}</ErrorText>}
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
			<UpdateUserAvatar avatarURL={avatarURL} OnUpdateUserField={OnUpdateUserField}/>
			<div>
				<UpdateUsername username={username} OnUpdateUserField={OnUpdateUserField}/>
				<InfoRow>
					<p>Rank: {rank}</p>
				</InfoRow>
				<InfoRow>
					<p>Registre date: {registred}</p>
				</InfoRow>
				<UpdateUserEmail email={email} OnUpdateUserField={OnUpdateUserField} />
				{unverifiedEmail && <VerifyEmail unverifiedEmail={unverifiedEmail} />}
				<UpdateUserDescription description={description} OnUpdateUserField={OnUpdateUserField}/>
			</div>
		</UserInfoStyles>
	)
}

type UpdateUserAvatarProps = { 
	avatarURL: string;
	OnUpdateUserField: (field: keyof User, value: any)=>Promise<void>;
}

function UpdateUserAvatar({avatarURL, OnUpdateUserField} : UpdateUserAvatarProps) {
	const imgInputRef = useRef<HTMLInputElement | null>(null)
	function handleAvatar() {
		imgInputRef.current?.click()
	}

	async function handleUpdateAvatar(e:React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file) return
		const avatarForm = new FormData()
		avatarForm.append("avatar", file)
		const res = await fetch("/api/upload/avatar", {
			method: "POST",
			body: avatarForm,
		})
		if (!res.ok)
			return
		const data = await res.json()
		await OnUpdateUserField("avatarURL", data.url)
		// const imgUrl = URL.createObjectURL(file)
		// await OnUpdateUserField("avatarURL", imgUrl)
	}

	return (
		<UserAvatarStyle>
			<img src={avatarURL? avatarURL : userAvatar} alt='avatar'/>
			<button onClick={handleAvatar}>Edit🖊️​</button>
			<input type="file" accept=".png" ref={imgInputRef} onChange={handleUpdateAvatar} />
		</UserAvatarStyle>
	)
}

type UpdateUsernameProps = {
	username: string;
	OnUpdateUserField: (field: keyof User, value: any)=>Promise<void>;
}

function UpdateUsername({username, OnUpdateUserField} : UpdateUsernameProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [errors, setErrors] = useState<string[]>([])
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState("")

	useEffect(()=>{
		if (edit)
			inputRef.current?.focus()
	}, [edit])
	async function handleSaving() {
		const username = sanitizeUsername(value)
		if (!username) {
			setErrors([])
			setEdit(false)
			return
		}
		const allErrors = [...validateUsername(username)]
		if (allErrors.length > 0) {
			setErrors(allErrors)
			setValue("")
			return
		}
		await OnUpdateUserField("username", username)
		setEdit(false)
		setErrors([])
	}
	return (
		<div>
			<InfoRow>
				<p>Username: {edit? <input type="text" ref={inputRef} value={value} onChange={e=>setValue(e.target.value)}/> : username}</p>
				<button onClick={edit? handleSaving : ()=>setEdit(true)}>{edit? "save" : "🖊️"}</button>
			</InfoRow>
			{errors && errors.map((err, i)=><ProfileErrorText key={i}>{err}</ProfileErrorText>)}
		</div>
	)
}

type UpdateUserEmailProps = {
	email: string;
	OnUpdateUserField: (field: keyof User, value: any)=>Promise<void>;
}

function UpdateUserEmail({email, OnUpdateUserField} : UpdateUserEmailProps) {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)
	const [errors, setErrors] = useState<string[]>([])

	useEffect(()=>{
		if (edit)
			inputRef.current?.focus()
	}, [edit])
	async function handleSaving() {
		const userEmail = sanitizeEmail(value)
		if (!userEmail) {
			setErrors([])
			setEdit(false)
			return
		}
		const allErrors = [...validateEmail(userEmail)]
		if (allErrors.length > 0) {
			setErrors(allErrors)
			setValue("")
			return
		}
		await OnUpdateUserField("email", userEmail)
		setEdit(false)
		setErrors([])
	}

	return (
		<div>
			<InfoRow>
				<p>Email: {edit? 
					<input type='email'
						value={value} ref={inputRef}
						onChange={e=>setValue(e.target.value)}/>
						: email}</p>
				<button onClick={edit? handleSaving : ()=>setEdit(true)}>{edit? "save" : "🖊️"}</button>
			</InfoRow>
		{errors && errors.map((err, i)=><ProfileErrorText key={i}>{err}</ProfileErrorText>)}
		</div>
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
			setMessage("You'll receive a password reset link shortly....")
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
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(()=>{
		if (edit)
			inputRef.current?.focus()
	}, [edit])
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