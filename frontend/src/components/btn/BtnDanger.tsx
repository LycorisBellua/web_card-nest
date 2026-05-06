import styled from 'styled-components';
import BtnDefault from 'components/btn/BtnDefault';

const BtnDanger = styled(BtnDefault)`
  color: #d07070;
  border-color: rgba(200, 104, 104, 0.25);
  background: rgba(200, 104, 104, 0.08);

  &:hover {
    background: rgba(200, 104, 104, 0.15);
    border-color: rgba(200, 104, 104, 0.4);
  }
`;

export default BtnDanger;
