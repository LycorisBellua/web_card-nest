import styled from 'styled-components';

const BtnDefault = styled.button`
  margin: 2px;
  padding: 9px 18px;
  cursor: pointer;
  border-radius: 10px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #e0c498;
  background: rgba(212, 160, 96, 0.07);
  border: 1px solid #50382a;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  transition:
    background 0.15s,
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.1s;

  &:hover {
    background: rgba(212, 160, 96, 0.13);
    border-color: rgba(212, 160, 96, 0.35);
    box-shadow: 0 5px 16px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: scale(0.96);
    background: rgba(212, 160, 96, 0.18);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export default BtnDefault;
