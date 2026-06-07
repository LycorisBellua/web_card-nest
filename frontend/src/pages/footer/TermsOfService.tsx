import { Link } from 'react-router-dom';
import { ScrollablePage } from 'components/general/Scrollable';
import styled from 'styled-components';

const Section = styled.section`
  margin-top: 20px;
  margin-bottom: 20px;
  text-align: justify;
`;

const H3 = styled.h3`
  margin-top: 15px;
`;

function TermsOfService() {
  return (
    <ScrollablePage>
      <h1>Terms of Service</h1>
      <p>Last updated: June 1, 2026</p>
      <Section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Card Nest (the "Service"), you agree to be bound
          by these Terms of Service ("Terms"). If you do not agree, do not use
          the Service.
        </p>
        <p>
          Card Nest ("we", "us", "our") is based in the European Union /
          European Economic Area.
        </p>
        <p>
          Contact: <em>no.rep.card.nest@gmail.com</em>
        </p>
      </Section>

      <Section>
        <h2>2. The Service</h2>
        <p>Card Nest provides:</p>
        <ul>
          <li>
            A <strong>public lobby chat</strong> accessible to all visitors,
            including guests who are not logged in.
          </li>
          <li>
            <strong>Black Crown</strong>, a multiplayer card game similar to
            Blackjack. Guests may play in local (single-device) mode. Registered
            users may play multiplayer.
          </li>
          <li>
            <strong>User accounts</strong> with a username and avatar, used to
            identify you in the lobby and in multiplayer games.
          </li>
          <li>
            A <strong>friends system</strong> allowing registered users to add
            each other and exchange private messages (DMs).
          </li>
        </ul>
      </Section>

      <Section>
        <h2>3. Accounts</h2>

        <H3>3.1 Registration</H3>
        <p>
          To access multiplayer features and messaging, you must register an
          account with a valid email address, a username, and a password. You
          must provide accurate information and keep it up to date.
        </p>

        <H3>3.2 Account security</H3>
        <p>
          You are responsible for maintaining the confidentiality of your
          password and for all activity that occurs under your account. Notify
          us immediately if you suspect unauthorised access.
        </p>

        <H3>3.3 One account per person</H3>
        <p>
          You may not create multiple accounts to evade moderation actions or
          for any other purpose.
        </p>
      </Section>

      <Section>
        <h2>4. User Conduct</h2>
        <p>
          By using Card Nest, you agree <strong>not</strong> to:
        </p>
        <ul>
          <li>
            Post content that is illegal, hateful, discriminatory, threatening,
            harassing, defamatory, or sexually explicit.
          </li>
          <li>Impersonate another person or misrepresent your identity.</li>
          <li>
            Attempt to disrupt or exploit the Service, including its game
            mechanics.
          </li>
          <li>
            Use automated bots, scripts, or tools to interact with the Service.
          </li>
          <li>
            Share another user's personal information without their consent.
          </li>
          <li>
            Use the Service for any commercial purpose without our written
            consent.
          </li>
        </ul>
        <p>
          These rules apply to all areas of the Service, including the lobby
          chat, usernames, avatars, profile descriptions, and private messages.
        </p>
      </Section>

      <Section>
        <h2>5. Moderation and Enforcement</h2>
        <p>
          We reserve the right to take any of the following actions if you
          violate these Terms or behave in a way that is harmful to other users
          or the Service:
        </p>

        <ul>
          <li>
            <div>
              <strong>Chat timeout</strong> - a moderator may temporarily
              prevent you from sending messages in the public lobby.
            </div>
          </li>
          <li>
            <div>
              <strong>Message removal or editing</strong> - a moderator may
              remove or overwrite a lobby message that violates these Terms.
            </div>
          </li>
          <li>
            <div>
              <strong>Profile modification</strong> - a moderator may modify or
              remove your username, profile description, or avatar if they are
              deemed offensive, harmful, impersonating, or otherwise in
              violation of these Terms.
            </div>
          </li>
          <li>
            <div>
              <strong>Account suspension or termination</strong> - we may
              suspend or permanently terminate your account at our discretion
              for serious or repeated violations, without prior notice.
            </div>
          </li>
        </ul>

        <div>
          <p>
            <strong>Profile changes are final.</strong> Moderator modifications
            to your username, description, or avatar are not subject to reversal
            at your request. You may contact us to raise a concern, but we are
            under no obligation to restore the original content.
          </p>
        </div>

        <p>
          Moderation decisions are made in good faith. We are not liable for any
          loss or inconvenience resulting from a moderation action taken under
          these Terms.
        </p>
      </Section>

      <Section>
        <h2>6. Content You Post</h2>

        <H3>6.1 Your responsibility</H3>
        <p>
          You are solely responsible for the content you post, including lobby
          messages, DMs, usernames, and avatars. Do not post content you do not
          have the right to share.
        </p>

        <H3>6.2 Lobby messages are public</H3>
        <p>
          The public lobby is visible to all users, including guests who are not
          logged in.{' '}
          <strong>
            Do not share personal or sensitive information in the public lobby.
          </strong>
        </p>

        <H3>6.3 Data exports by other users</H3>
        <p>
          Other registered users may export data from conversations they
          participated in, including lobby messages and DM threads. This means
          messages you sent may appear in another user's data export. Please see
          our <Link to="/privacy-policy">Privacy Policy</Link> for more
          information.
        </p>

        <H3>6.4 Anonymisation on account deletion</H3>
        <p>
          If you delete your account, your lobby messages will remain visible
          but attributed to "Guest" rather than your username. They cannot be
          individually removed at that point.
        </p>
      </Section>

      <Section>
        <h2>7. Intellectual Property</h2>
        <p>
          Card Nest and its content - including game logic, design, and branding
          - are the property of Card Nest. You may not copy, reproduce, or
          distribute any part of the Service without our prior written consent.
        </p>
      </Section>

      <Section>
        <h2>8. Disclaimer of Warranties</h2>
        <p>
          The Service is provided <strong>"as is"</strong> and{' '}
          <strong>"as available"</strong> without warranties of any kind,
          express or implied. We do not guarantee that the Service will be
          uninterrupted, error-free, or free of harmful components.
        </p>
      </Section>

      <Section>
        <h2>9. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by applicable law, we shall not be
          liable for any indirect, incidental, or consequential damages arising
          out of your use of - or inability to use - the Service. Nothing in
          these Terms limits liability for death, personal injury, or fraud
          caused by our negligence.
        </p>
      </Section>

      <Section>
        <h2>10. Account Deletion</h2>
        <p>
          You may delete your account at any time from your account settings.
          The effects of deletion are described in the{' '}
          <Link to="/privacy-policy">Privacy Policy</Link>. We may also delete
          inactive accounts after an extended period of inactivity, with
          reasonable prior notice where possible.
        </p>
      </Section>

      <Section>
        <h2>11. Changes to the Service and These Terms</h2>
        <p>
          We may modify or discontinue the Service, or update these Terms, at
          any time. Material changes will be communicated by posting the updated
          version on this page with a revised "last updated" date. Continued use
          of the Service after changes are posted constitutes your acceptance of
          the revised Terms.
        </p>
      </Section>

      <Section>
        <h2>12. Governing Law</h2>
        <p>
          These Terms are governed by the laws of France, without regard to its
          conflict-of-law provisions. Any disputes shall be subject to the
          exclusive jurisdiction of the courts of Nice.
        </p>
      </Section>

      <Section>
        <h2>13. Contact</h2>
        <p>For any questions about these Terms, contact us at:</p>
        <p>
          <strong>
            <em>no.rep.card.nest@gmail.com</em>
          </strong>
        </p>
      </Section>
    </ScrollablePage>
  );
}

export default TermsOfService;
