import type { UserLimitedOrGuest } from 'context/Types';
import { CanDisciplineThisUser } from 'functions/Ranks';
import { BtnDefault } from 'components/btn/Btn';

function ToggleChatTimeout({ user }: { user: UserLimitedOrGuest }) {
  if (!CanDisciplineThisUser(user)) {
    return <></>;
  }

  // TODO: Ideally, the button says "Enable" or "Disable" so that we know
  // what state we are in before pressing the button, but it's not necessary.
  if (!user) {
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
