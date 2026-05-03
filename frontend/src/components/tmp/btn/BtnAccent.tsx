import styled from 'styled-components';
import BtnDefault from 'components/tmp/btn/BtnDefault';

const BtnAccent = styled(BtnDefault)`
  background: rgba(212, 160, 96, 0.14);
  border-color: rgba(212, 160, 96, 0.35);
  color: #f0c06a;

  &:hover {
    background: rgba(212, 160, 96, 0.22);
    border-color: rgba(212, 160, 96, 0.55);
    box-shadow: 0 5px 16px rgba(212, 160, 96, 0.2);
  }
`;

export default BtnAccent;
