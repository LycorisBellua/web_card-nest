import { Link } from 'react-router-dom';
import { ScrollablePage } from 'components/general/Scrollable';
import { BtnDefault } from 'components/btn/Btn';
import styled from 'styled-components';

const Section = styled.section`
  margin-top: 20px;
  margin-bottom: 20px;
  text-align: justify;
`;

const Subtitle = styled.h3`
  margin-top: 15px;
`;

const Parag = styled.p`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const List = styled.ul`
  margin-top: 15px;
  margin-bottom: 15px;
`;

const Table = styled.div`
  overflow-x: auto;

  table {
    margin: 20px;
    font-size: 0.9rem;
  }

  th,
  td {
    padding: 10px 14px;
    text-align: left;
    border: 1px solid #e0e0e0;
  }

  th {
    font-weight: 600;
    background-color: #f5f5f5;
    color: #18120f;
  }
`;

function PrivacyPolicy() {
  return (
    <ScrollablePage>
      <h1>Privacy Policy</h1>
      <p>Last updated: June 1, 2026</p>

      <Section>
        <h2>1. Who We Are</h2>
        <Parag>
          Card Nest ("we", "us", "our") is based the European Union / European
          Economic Area. We are the <strong>data controller</strong> for all
          personal data processed through this website.
        </Parag>
        <Parag>
          Contact: <em>no.rep.card.nest@gmail.com</em>
        </Parag>
      </Section>

      <Section>
        <h2>2. What Data We Collect and Why</h2>

        <Subtitle>2.1 Registered users (account holders)</Subtitle>
        <Parag>When you create an account, we collect:</Parag>
        <List>
          <li>
            <strong>Email address</strong>: used to authenticate your account
            and send transactional emails (e.g. password resets).
          </li>
          <li>
            <strong>Username</strong>: displayed publicly in the lobby chat, in
            multiplayer games, and on your profile.
          </li>
          <li>
            <strong>Avatar image</strong>: displayed publicly alongside your
            username. You provide this voluntarily.
          </li>
          <li>
            <strong>Password</strong>: stored as a one-way cryptographic hash.
            We never store or transmit your plain-text password.
          </li>
          <li>
            <strong>Friend relationships</strong>: the list of users you have
            added as friends, stored to enable private messaging.
          </li>
          <li>
            <strong>Direct messages (DMs)</strong>: messages exchanged privately
            between you and friends you have added.
          </li>
        </List>
        <Parag>
          <strong>Legal basis:</strong> Performance of a contract (Article
          6(1)(b) GDPR): this data is necessary to provide you with the services
          you signed up for.
        </Parag>

        <Subtitle>2.2 Guests (non-registered visitors)</Subtitle>
        <Parag>
          Guests may participate in the lobby chat and play Black Crown in local
          mode. No account is required and no personal data is collected from
          guests beyond what is inherent in any internet connection.
        </Parag>

        <Subtitle>2.3 Lobby chat messages</Subtitle>
        <Parag>
          Lobby messages are <strong>publicly visible</strong> to all users,
          including guests. If you are logged in, your username is attached to
          your messages. Please do not share personal information in the public
          lobby.
        </Parag>
        <Parag>
          <strong>Legal basis:</strong> Legitimate interests (Article 6(1)(f)
          GDPR): operating a functional public chat space.
        </Parag>

        <Subtitle>2.4 Technical data</Subtitle>
        <Parag>
          We do not maintain server-side logs of IP addresses or other technical
          metadata. No browser fingerprints, analytics cookies, or tracking
          technologies are used.
        </Parag>

        <Subtitle>
          2.5 Data we do <em>not</em> collect
        </Subtitle>
        <List>
          <li>
            Game results, scores, or statistics: Black Crown sessions are
            entirely ephemeral and nothing is persisted after a session ends.
          </li>
          <li>Date of birth or any demographic information.</li>
          <li>Payment information: Card Nest has no paid features.</li>
        </List>
      </Section>

      <Section>
        <h2>3. How We Use Your Data</h2>
        <Parag>We use the data described above solely to:</Parag>
        <List>
          <li>Create and maintain your account.</li>
          <li>
            Display your username and avatar in the lobby and in multiplayer
            games.
          </li>
          <li>Enable friend connections and private messaging (DMs).</li>
          <li>
            Send transactional emails (e.g. password reset requests) that you
            initiate.
          </li>
          <li>
            Allow moderators to maintain a safe environment (see Section 6).
          </li>
        </List>
        <Parag>
          We do <strong>not</strong> use your data for advertising, profiling,
          or automated decision-making.
        </Parag>
      </Section>

      <Section>
        <h2>4. Data Sharing and Third Parties</h2>
        <Parag>We share your data with as few parties as possible.</Parag>

        <Subtitle>4.1 Email delivery (Google / Gmail)</Subtitle>
        <Parag>
          Transactional emails (such as password resets) are sent from a Gmail
          account via Nodemailer. When an email is sent to you, your email
          address is processed by <strong>Google LLC</strong> acting as a data
          processor on our behalf. Google's privacy policy is available at{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener"
          >
            policies.google.com/privacy
          </a>
          .
        </Parag>
        <Parag>
          We do not share your data with any other third parties. We do not sell
          your data. We do not use advertising networks or analytics services.
        </Parag>

        <Subtitle>4.2 Visibility to other users</Subtitle>
        <Parag>By using Card Nest, you acknowledge that:</Parag>
        <List>
          <li>
            <strong>Your username and avatar</strong> are visible to all users
            and guests.
          </li>
          <li>
            <strong>Your lobby messages</strong> are visible to all users and
            guests, and are permanently associated with your username while your
            account exists.
          </li>
          <li>
            <strong>Other registered users may request a data export</strong>{' '}
            that includes lobby and DM messages they themselves participated in
            (see Section 7). This means messages you sent in a shared
            conversation may appear in another user's data export. Please be
            mindful of the information you choose to share publicly or in
            private messages.
          </li>
        </List>
      </Section>

      <Section>
        <h2>5. Cookies</h2>
        <Parag>
          We use one cookie, described below. No third-party cookies,
          advertising cookies, or analytics cookies are set by Card Nest.
        </Parag>

        <Table>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Purpose</th>
                <th>Type</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>refresh_token</td>
                <td>
                  Keeps you logged in between sessions by storing a secure token
                  used to renew your authentication. This cookie is strictly
                  necessary for the login functionality to work.
                </td>
                <td>Strictly necessary (HTTP-only, secure)</td>
                <td>Until you log out or the token expires</td>
              </tr>
            </tbody>
          </table>
        </Table>

        <div>
          <Parag>
            Because this cookie is strictly necessary for authentication, it
            does not require your consent under the ePrivacy Directive. It is
            set only when you log in and is deleted when you log out or delete
            your account.
          </Parag>
        </div>
      </Section>

      <Section>
        <h2>6. Moderation and Account Actions</h2>
        <Parag>
          Card Nest moderators may take the following actions to maintain a safe
          and respectful environment:
        </Parag>
        <List>
          <li>
            <strong>Chat timeout</strong>: temporarily restricting your ability
            to write in the lobby.
          </li>
          <li>
            <strong>Message editing</strong>: overwriting a lobby message that
            violates our rules.
          </li>
          <li>
            <strong>Username or description modification</strong>: changing a
            username or profile description that is offensive, harmful, or in
            violation of our Terms of Service. You may not reverse a moderator's
            change to your username or description.
          </li>
          <li>
            <strong>Avatar removal</strong>: removing an avatar that violates
            our rules.
          </li>
        </List>
        <Parag>
          These actions are taken under our legitimate interest in operating a
          safe platform (Article 6(1)(f) GDPR) and are a condition of using the
          service. They do not constitute unlawful processing of your personal
          data.
        </Parag>
      </Section>

      <Section>
        <h2>7. Your Rights Under the GDPR</h2>
        <Parag>
          As a data subject under the GDPR, you have the following rights:
        </Parag>

        <Table>
          <table>
            <thead>
              <tr>
                <th>Right</th>
                <th>What it means in practice</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Access</td>
                <td>
                  You can request a copy of the personal data we hold about you.
                </td>
              </tr>
              <tr>
                <td>Portability</td>
                <td>
                  You can export your data directly from Card Nest (see below).
                </td>
              </tr>
              <tr>
                <td>Rectification</td>
                <td>
                  You can update your username, avatar, and email address in
                  your account settings.
                </td>
              </tr>
              <tr>
                <td>Erasure</td>
                <td>
                  You can delete your account at any time (see Section 8).
                </td>
              </tr>
              <tr>
                <td>Restriction</td>
                <td>
                  You can ask us to restrict processing of your data in certain
                  circumstances.
                </td>
              </tr>
              <tr>
                <td>Objection</td>
                <td>
                  You can object to processing based on legitimate interests.
                </td>
              </tr>
            </tbody>
          </table>
        </Table>

        <Subtitle>7.1 Data export (portability)</Subtitle>
        <Parag>
          You may request an export of your personal data at any time from
          within your account settings. You can select any combination of the
          following:
        </Parag>
        <List>
          <li>
            Your <strong>user profile</strong> (username, email address, avatar)
          </li>
          <li>
            Your <strong>lobby chat messages</strong>
          </li>
          <li>
            Your <strong>direct messages (DMs)</strong>
          </li>
        </List>
        <Parag>
          Exports are provided in a standard, machine-readable format. We will
          process your request promptly.
        </Parag>
        <div>
          <Parag>
            Because lobby messages are part of a shared, public conversation,
            another user who participated in the same lobby may receive copies
            of your public messages as part of their own data export. This is
            inherent to any public chat service.
          </Parag>
        </div>

        <Link to="/data-extraction">
          <BtnDefault>Go to Personal Data Extraction Page</BtnDefault>
        </Link>

        <Subtitle>7.2 Right to lodge a complaint</Subtitle>
        <Parag>
          If you believe we have not handled your personal data lawfully, you
          have the right to lodge a complaint with your national data protection
          authority. A list of EU/EEA supervisory authorities is available at{' '}
          <a
            href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
            target="_blank"
            rel="noopener"
          >
            edpb.europa.eu
          </a>
          .
        </Parag>
      </Section>

      <Section>
        <h2>8. Account Deletion and Data Retention</h2>
        <Parag>
          You may delete your account at any time from your account settings.
          Upon deletion:
        </Parag>
        <List>
          <li>
            Your <strong>user profile</strong> (email, username, avatar, friend
            list) is permanently deleted.
          </li>
          <li>
            Your <strong>direct messages (DMs)</strong> are permanently deleted.
          </li>
          <li>
            Your <strong>lobby messages</strong> are anonymised. They remain
            visible in the lobby but are reassigned to the "Guest" author. They
            are no longer linked to your identity.
          </li>
        </List>
        <Parag>
          We retain data only for as long as necessary to provide the service.
          We do not maintain backups or archives that would preserve deleted
          data beyond this process.
        </Parag>
      </Section>

      <Section>
        <h2>9. Security</h2>
        <Parag>
          We take reasonable technical measures to protect your data, including
          hashing passwords with a one-way algorithm and using HTTP-only, secure
          cookies for authentication tokens. However, no internet service can
          guarantee absolute security. Please use a strong, unique password for
          your Card Nest account.
        </Parag>
      </Section>

      <Section>
        <h2>10. Children</h2>
        <Parag>
          Card Nest does not have an age restriction. However, we do not
          knowingly collect data from children under the age of 13 without
          verifiable parental consent, as required by applicable law. If you
          believe a child under 13 has created an account without consent,
          please contact us at the address below and we will delete the account
          promptly.
        </Parag>
      </Section>

      <Section>
        <h2>11. Changes to This Policy</h2>
        <Parag>
          We may update this Privacy Policy from time to time. If we make
          material changes, we will post the updated policy on this page with a
          revised "last updated" date. Continued use of Card Nest after such
          changes constitutes acceptance of the updated policy.
        </Parag>
      </Section>

      <Section>
        <h2>12. Contact</h2>
        <Parag>
          For any questions, requests, or concerns regarding your personal data,
          contact us at:
          <br />
          <strong>
            <em>no.rep.card.nest@gmail.com</em>
          </strong>
        </Parag>
      </Section>
    </ScrollablePage>
  );
}

export default PrivacyPolicy;
