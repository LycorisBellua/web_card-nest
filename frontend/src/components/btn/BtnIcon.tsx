import styled from 'styled-components';

const BtnIcon = styled.button`
  width: 48px;
  height: 48px;
  border: 1px solid #50382a;
  cursor: pointer;
  border-radius: 12px;
  background: #221a14;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7a5c42;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s,
    transform 0.1s;

  &:hover {
    background: rgba(212, 160, 96, 0.1);
    border-color: rgba(212, 160, 96, 0.3);
    color: #d9a85a;
  }

  &:active {
    transform: scale(0.9);
  }
`;

export default BtnIcon;
