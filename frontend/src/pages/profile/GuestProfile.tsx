import { DisplayPublicUserInfo } from 'pages/profile/DisplayUserInfo';
import { ScrollablePage } from 'components/general/Scrollable';
import { BtnDefault } from 'components/btn/Btn';

function GuestProfile() {
  return (
    <ScrollablePage>
      <DisplayPublicUserInfo user={null} />
	  <div>
	    <BtnDefault>Click Me</BtnDefault>
	  </div>
    </ScrollablePage>
  );
}

export default GuestProfile;
