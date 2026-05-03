import styled from 'styled-components';

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
`;

const Spin = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #221a14;
  border: 1px solid #50382a;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid rgba(212, 160, 96, 0.12);
    border-top-color: #d9a85a;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Label = styled.span`
  font-size: 0.78rem;
  color: #7a5c42;
`;

function Spinner({ label }: { label?: string }) {
  return (
    <Row>
      <Spin></Spin>
      {label && <Label>{label}</Label>}
    </Row>
  );
}

export default Spinner;
