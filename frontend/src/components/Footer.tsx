import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterDiv = styled.footer`
  margin-top: 1rem;
  text-align: center;

  a {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }

  @media (max-width: 680px) {
    margin-bottom: 1rem;
  }
`;

function Footer() {
  return (
    <FooterDiv>
      <Link to="privacy-policy">Privacy Policy</Link>
      <Link to="terms-of-service">Terms of Service</Link>
      <Link to="credits">Credits</Link>
    </FooterDiv>
  );
}

export default Footer;
