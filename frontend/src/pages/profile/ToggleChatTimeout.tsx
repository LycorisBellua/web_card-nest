import type { UserLimitedOrGuest } from 'context/Types';
import { useUser } from 'context/useUser';
import { CanDisciplineThisUser } from 'functions/Ranks';
import { BtnDefault } from 'components/btn/Btn';

function ToggleChatTimeout({ otherUser }: { otherUser: UserLimitedOrGuest }) {
  const { user } = useUser();

  if (!CanDisciplineThisUser(user, otherUser)) {
    return <></>;
  }

  // TODO: Ideally, the button says "Enable" or "Disable" so that we know
  // what state we are in before pressing the button, but it's not necessary.
  if (!otherUser) {
    // TODO: All guests
  } else {
    // TODO: This specific user.
  }

  return (
    <>
      <BtnDefault>Toggle Chat Timeout</BtnDefault>
    </>
  );
}

export default ToggleChatTimeout;
