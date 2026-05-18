import { Link } from 'react-router-dom';
import { ScrollablePage } from 'components/general/Scrollable';
import { BtnDefault } from 'components/btn/Btn';

function PrivacyPolicy() {
  return (
    <ScrollablePage>
      <h1>Privacy Policy</h1>
      <p>Lorem ipsum dolor sit amet...</p>
      <Link to="/data-extraction">
        <BtnDefault>Go to Personal Data Extraction Page</BtnDefault>
      </Link>
    </ScrollablePage>
  );
}

export default PrivacyPolicy;
