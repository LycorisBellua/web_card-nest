import { Link } from 'react-router-dom';
import Logo from 'components/style/Logo';
import cardNestLogo from '/favicon.svg';

function Home() {
  return (
    <>
      <Logo src={cardNestLogo} alt='Card Nest logo' />
      <div>
        <Link to='/signup'>
          <button>Sign Up</button>
        </Link>
        <Link to='/login'>
          <button>Log In</button>
        </Link>
      </div>
      <p><Link to='/placeholder'>Go the placeholder page</Link></p>
    </>
  );
}

export default Home;
