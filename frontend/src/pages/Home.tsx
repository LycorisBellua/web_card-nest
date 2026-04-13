import { Link } from 'react-router-dom';
import Button from 'components/Button';

function Home() {
  return (
    <>
      <Link to="/signup">
        <Button>Sign Up</Button>
      </Link>
      <Link to="/login">
        <Button>Log In</Button>
      </Link>
    </>
  );
}

export default Home;
