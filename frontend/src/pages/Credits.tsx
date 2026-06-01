import { Link } from 'react-router-dom';
import { Container } from 'components/style/SignForm';

function Credits() {
  return (
    <Container>
      <h1>Credits</h1>
      <h2>Authors</h2>
      <p>This project has been created as part of a school curriculum by:</p>
      <ul>
        <li>
          <Link to="https://github.com/LycorisBellua">Lycoris Bellua</Link>
        </li>
        <li>
          <Link to="https://github.com/joshw34">Joshw34</Link>
        </li>
        <li>
          <Link to="https://github.com/cngogang">Cngogang</Link>
        </li>
        <li>
          <Link to="https://github.com/Hong-CHP">Hong-CHP</Link>
        </li>
        <li>
          <Link to="https://github.com/Romtry">Romtry</Link>
        </li>
      </ul>
      <h2>Assets</h2>
      <ul>
        <li>
          <Link to="https://emojipedia.org/google/16.0/joker">Favicon</Link>
        </li>
        <li>
          <Link to="https://freesvg.org/user-icon-picture">
            User default avatar
          </Link>
        </li>
        <li>
          <Link to="https://freesvg.org/user-icon">Guest avatar</Link>
        </li>
      </ul>
    </Container>
  );
}

export default Credits;
