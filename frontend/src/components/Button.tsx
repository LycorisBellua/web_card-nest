import styled from 'styled-components';

const Button = styled.button`
  font: inherit;
  background: none;
  cursor: pointer;
  text-align: center;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: #aa8a68;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: rgba(212, 160, 112, 0.16);
    color: #f0c06a;
  }
`;

export default Button;
