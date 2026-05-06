import styled from 'styled-components';
import BtnDefault from 'components/btn/BtnDefault';

const BtnGhost = styled(BtnDefault)`
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  color: #aa8a68;

  &:hover {
    background: rgba(212, 160, 96, 0.06);
    border-color: #3a2a1e;
  }
`;

export default BtnGhost;
