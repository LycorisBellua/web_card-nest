import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterStyle = styled.footer`
  position: relative;
  bottom: 0px;
  margin: 20px;

  a {
    margin: 15px;
  }
`;

function Footer() {
  return (
    <FooterStyle>
      <Link to="privacy-policy">Privacy Policy</Link>
      <Link to="terms-of-service">Terms of Service</Link>
      <Link to="credits">Credits</Link>
    </FooterStyle>
  );
}

export default Footer;
