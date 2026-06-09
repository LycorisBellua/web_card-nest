import { Link } from 'react-router-dom';
import { useUser } from 'context/useUser';
import { ScrollablePage } from 'components/general/Scrollable';
import { BtnDefault } from 'components/btn/Btn';

/**
 * Landing page for /play.
 * The Online game button is only shown when the user is logged in and not
 * pending — matching the access guard in PlayOnline.
 */
export default function Play() {
  const { user } = useUser();
  const canPlayOnline = !!user && user.rank.toLowerCase() !== 'pending';

  return (
    <ScrollablePage>
      <Link to="local">
        <BtnDefault>Local game</BtnDefault>
      </Link>
      {canPlayOnline && (
        <Link to="online">
          <BtnDefault>Online game</BtnDefault>
        </Link>
      )}
    </ScrollablePage>
  );
}
