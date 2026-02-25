import { Link } from 'react-router-dom';
import Logo from 'components/style/Logo';
import cardNestLogo from '/joker.svg';

function Home() {
  return (
    <>
      <Logo src={cardNestLogo} alt='Card Nest logo' />
      <Link to='/signup'>
        <button>Sign up</button>
      </Link>
      <p><Link to='/placeholder'>Go the placeholder page</Link></p>
    </>
  )
}

export default Home;
