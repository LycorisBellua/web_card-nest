import { ScrollablePage } from 'components/general/Scrollable';
import LogIn from 'pages/todo/LogIn';
import SignUp from 'pages/todo/SignUp';

function Auth() {
  return (
    <ScrollablePage>
      <LogIn />
      <SignUp />
    </ScrollablePage>
  );
}

export default Auth;
