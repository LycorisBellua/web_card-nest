import styled from 'styled-components';

export const TableWrapper = styled.div`
	div {
		margin-top: 10px;
		display: flex;
		gap: 10px;
		justify-content: center;
		align-items: center;
	}
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
