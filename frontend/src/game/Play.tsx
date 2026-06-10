import { Link } from 'react-router-dom';
import { useUser } from 'context/useUser';
import { ScrollablePage } from 'components/general/Scrollable';
import Section from 'components/general/Section';
import CenterButtons from 'components/btn/CenterButtons';
import { BtnDefault } from 'components/btn/Btn';

/**
 * Landing page for /play.
 * The Online Mode button is only shown when the user is logged in and not
 * pending - matching the access guard in PlayOnline.
 */
export default function Play() {
  const { user } = useUser();
  const canPlayOnline = !!user && user.rank.toLowerCase() !== 'pending';

  return (
    <ScrollablePage>
      <h1>Black Crown</h1>

      <CenterButtons>
        <Link to="local">
          <BtnDefault>Local Mode</BtnDefault>
        </Link>
        {canPlayOnline && (
          <Link to="online">
            <BtnDefault>Online Mode</BtnDefault>
          </Link>
        )}
      </CenterButtons>

      <Section>
        <p>
          Black Crown is a 2 to 4 player card game based on Blackjack. The goal
          is to build a hand as close to 21 points as possible without going
          over. There is no house: only the players competing against each
          other, and only one winner per game.
        </p>

        <h2>Card values</h2>
        <p>
          Number cards (2-10) are worth their face value. Face cards (Jack,
          Queen, King) are worth 10. An Ace is worth 11 unless that would push
          your total above 21, in which case it counts as 1: this is decided
          automatically.
        </p>

        <h2>How a round works</h2>
        <p>
          Each player is dealt one card face-up, then a second card that only
          they can see. On your turn you may <strong>hit</strong> (take another
          card, visible to all) as many times as you like, or{' '}
          <strong>stand</strong> to lock in your total. If your hand exceeds 21
          you <strong>bust</strong> and are out of the round. If you are the
          last player who could still hit but everyone else has busted, you are
          automatically forced to stand: congratulations, you're the winner!
        </p>

        <h2>Winning</h2>
        <p>
          Once no one can act, the highest total among non-busted players wins.
          On a tie, the player who reached that total first wins. One hand beats
          all others: the <strong>Black Crown</strong>. It's an Ace paired with
          any 10-value card, totalling 21 in exactly two cards.
        </p>
      </Section>
    </ScrollablePage>
  );
}
