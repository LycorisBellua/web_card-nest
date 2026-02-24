import { Link } from 'react-router-dom';
import Logo from 'components/style/Logo';
import cardNestLogo from '/joker.svg';

function Home() {
  return (
    <>
      <Logo src={cardNestLogo} alt='Card Nest logo' />
      <p><Link to='/placeholder'>Go the placeholder page</Link></p>
    </>
  )
}

export default Home;
