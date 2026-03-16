import styled from 'styled-components';
import { ErrorText } from './SignForm';

export const Page = styled.div`
	width: 80%;
	p {
		margin: 4px
	}
`;

export const ProfileErrorText = styled(ErrorText)`
	margin-left: 20px;

`;

export const UserInfoStyles = styled.div`
	background-color: #542C0E;
	padding: 20px;
	border-radius: 10px;
	margin: auto;
	h2 {
		margin: 4px
	}
	.main {
		margin-top: 16px;
	}
`;

export const UserAvatarStyle = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;

	img {
		max-width: 100px;
		max-height: 100px;
		object-fit: cover;
		border-radius: 50%;
	}
	.btn {
		position: absolute;
		top: 90px;
		display: flex;
		gap: 10px;
	}
	input {
		display: none;
	}
`;

export const InfoRow = styled.div`
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

export const PasswordReset = styled.div`
	margin-left: 20px;
	display: flex;
	flex-direction: column;

	div {
		margin-bottom: 4px;
	}
`;

export const DescriptionTextarea = styled.div`
	p {
		margin-left: 20px;
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

export const VerifyEmailMsg = styled.p`
	margin-left: 20px;
	font-size: 12px;
`;
