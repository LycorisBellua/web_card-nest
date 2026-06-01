import styled from 'styled-components';

export const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 0 16px;

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
  inset: 0;
  backdrop-filter: blur(6px);
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  z-index: 999;
`;

export const OverlayStyle = styled.div`
  color: white;
  text-align: center;
`;

export const PlayTableStyle = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  aspect-ratio: 3 / 2;
  margin-top: 40px;
  background: #1b5e20;
  border-radius: 12px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.6),
    inset 0 0 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

export const PlayerCountStyle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const RecordTableWrapper = styled.div`
  max-width: 100%;
  overflow-x: auto;
  margin-bottom: 20px;
`;

export const RecordTableStyle = styled.table`
  border-collapse: collapse;
  th,
  td {
    border: 1px solid;
    padding: 10px;
    white-space: nowrap;
  }
`;

export const ShowFinishedStyle = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 999;
  color: white;
  text-align: center;
  border-radius: 12px;

  .btn {
    margin-top: 16px;
    display: flex;
    gap: 10px;
    justify-content: center;
    align-items: center;
  }
`;
