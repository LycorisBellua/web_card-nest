import { ScrollablePage } from 'components/general/Scrollable';
import LogIn from 'pages/LogIn';
import SignUp from 'pages/SignUp';

function Auth() {
  return (
    <ScrollablePage>
      <LogIn />
      <SignUp />
    </ScrollablePage>
  );
}

export default Auth;
