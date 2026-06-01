import { Container } from 'components/style/SignForm';

function VerifyError() {
  return (
    <Container>
      <h1>Verification Failed</h1>
      <p>The verification link is invalid or has expired.</p>
    </Container>
  );
}

export default VerifyError;
