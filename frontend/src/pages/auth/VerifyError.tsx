import { ScrollablePage } from 'components/general/Scrollable';

function VerifyError() {
  return (
    <ScrollablePage>
      <h1>Verification Failed</h1>
      <p>The verification link is invalid or has expired.</p>
    </ScrollablePage>
  );
}

export default VerifyError;
