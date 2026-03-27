import styled from 'styled-components';

export const TableWrapper = styled.div`
	position: relative;
	.btn {
		margin-top: 10px;
		display: flex;
		gap: 10px;
		justify-content: center;
		align-items: center;
	}
`;

export const Overlay = styled.div`
	position: absolute;
	backdrop-filter: blur(6px);
	inset: 0;
	background: rgba(0,0,0,0.8);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	z-index: 999;
`;


export const PlayTableStyle = styled.div`
	position: relative;
  	width: 90vw;
  	max-width: 900px;
  	aspect-ratio: 3 / 2;  
	margin-top: 40px;
	background: #1b5e20;
	border-radius: 12px;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), inset 0 0 60px rgba(0, 0, 0, 0.3);
	overflow: hidden;

	canvas {
		width: 100%;
		height: 100%;
		display: block;
	}
`;

export const PlayerCountStyle = styled.div`
	display:flex;
	flex-direction: column;
	gap: 20px;
`;

export const RecordTableStyle = styled.table`
	border-collapse: collapse;
	th, td {
		border: 1px solid;
		padding: 10px;
	}
	margin-bottom: 20px;
`;

export const ShowFinishedStyle = styled(Overlay)`
	background: rgba(0,0,0,0.3);
	backdrop-filter: none;
`;
