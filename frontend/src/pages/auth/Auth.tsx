import { ScrollablePage } from 'components/general/Scrollable';
import LogIn from 'pages/auth/LogIn';
import SignUp from 'pages/auth/SignUp';

function Auth() {
  return (
    <ScrollablePage>
      <LogIn />
      <SignUp />
    </ScrollablePage>
  );
}

export default Auth;
