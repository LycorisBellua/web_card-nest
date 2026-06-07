import { Link } from 'react-router-dom';
import { ScrollablePage } from 'components/general/Scrollable';
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

function TermsOfService() {
  return (
    <ScrollablePage>
      <h1>Terms of Service</h1>
      <p>Last updated: June 1, 2026</p>

      <Section>
        <h2>1. Acceptance of Terms</h2>
        <Parag>
          By accessing or using Card Nest (the "Service"), you agree to be bound
          by these Terms of Service ("Terms"). If you do not agree, do not use
          the Service.
        </Parag>
        <Parag>
          Card Nest ("we", "us", "our") is based in the European Union /
          European Economic Area.
        </Parag>
        <Parag>
          Contact: <em>no.rep.card.nest@gmail.com</em>
        </Parag>
      </Section>

      <Section>
        <h2>2. The Service</h2>
        <Parag>Card Nest provides:</Parag>
        <List>
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
            identify you in chat and in multiplayer games.
          </li>
          <li>
            A <strong>friends system</strong> allowing registered users to add
            each other and exchange private messages (DMs).
          </li>
        </List>
      </Section>

      <Section>
        <h2>3. Accounts</h2>

        <Subtitle>3.1 Registration</Subtitle>
        <Parag>
          To access multiplayer features and messaging, you must register an
          account with a valid email address, a username, and a password. You
          must provide accurate information and keep it up to date.
        </Parag>

        <Subtitle>3.2 Account security</Subtitle>
        <Parag>
          You are responsible for maintaining the confidentiality of your
          password and for all activity that occurs under your account. Notify
          us immediately if you suspect unauthorised access.
        </Parag>

        <Subtitle>3.3 One account per person</Subtitle>
        <Parag>
          You may not create multiple accounts to evade moderation actions or
          for any other purpose.
        </Parag>
      </Section>

      <Section>
        <h2>4. User Conduct</h2>
        <Parag>By using Card Nest, you agree not to:</Parag>
        <List>
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
        </List>
        <Parag>
          These rules apply to all areas of the Service, including the lobby
          chat, usernames, avatars, profile descriptions, and private messages.
        </Parag>
      </Section>

      <Section>
        <h2>5. Moderation and Enforcement</h2>
        <Parag>
          We reserve the right to take any of the following actions if you
          violate these Terms or behave in a way that is harmful to other users
          or the Service:
        </Parag>

        <List>
          <li>
            <strong>Chat timeout</strong>: a moderator may temporarily prevent
            you from sending messages in the public lobby.
          </li>
          <li>
            <strong>Message editing</strong>: a moderator may overwrite a lobby
            message that violates these Terms.
          </li>
          <li>
            <strong>Profile modification</strong>: a moderator may modify or
            remove your username, profile description, or avatar if they are
            deemed offensive, harmful, impersonating, or otherwise in violation
            of these Terms.
          </li>
          <li>
            <strong>Account termination</strong>: we may permanently delete your
            account at our discretion for serious or repeated violations,
            without prior notice.
          </li>
        </List>

        <div>
          <Parag>
            Profile changes are final. Moderator modifications to your username,
            description, or avatar are not subject to reversal at your request.
            You may contact us to raise a concern, but we are under no
            obligation to restore the original content.
          </Parag>
        </div>

        <Parag>
          Moderation decisions are made in good faith. We are not liable for any
          loss or inconvenience resulting from a moderation action taken under
          these Terms.
        </Parag>
      </Section>

      <Section>
        <h2>6. Content You Post</h2>

        <Subtitle>6.1 Your responsibility</Subtitle>
        <Parag>
          You are solely responsible for the content you post, including lobby
          messages, DMs, usernames, profile descriptions, and avatars. Do not
          post content you do not have the right to share.
        </Parag>

        <Subtitle>6.2 Lobby messages are public</Subtitle>
        <Parag>
          The public lobby is visible to all users, including guests who are not
          logged in. Do not share personal or sensitive information in the
          public lobby.
        </Parag>

        <Subtitle>6.3 Data exports by other users</Subtitle>
        <Parag>
          Other registered users may export data from conversations they
          participated in, including lobby messages and DM threads. This means
          messages you sent may appear in another user's data export. Please see
          our <Link to="/privacy-policy">Privacy Policy</Link> for more
          information.
        </Parag>

        <Subtitle>6.4 Anonymization on account deletion</Subtitle>
        <Parag>
          If your account is deleted, your lobby messages will remain visible
          but attributed to "Guest" rather than your username.
        </Parag>
      </Section>

      <Section>
        <h2>7. Intellectual Property</h2>
        <Parag>
          Card Nest and its content - including game logic, design, and branding
          - are the property of Card Nest. You may not copy, reproduce, or
          distribute any part of the Service without our prior written consent.
        </Parag>
      </Section>

      <Section>
        <h2>8. Disclaimer of Warranties</h2>
        <Parag>
          The Service is provided "as is" and "as available" without warranties
          of any kind, express or implied. We do not guarantee that the Service
          will be uninterrupted, error-free, or free of harmful components.
        </Parag>
      </Section>

      <Section>
        <h2>9. Limitation of Liability</h2>
        <Parag>
          To the fullest extent permitted by applicable law, we shall not be
          liable for any indirect, incidental, or consequential damages arising
          out of your use of - or inability to use - the Service. Nothing in
          these Terms limits liability for death, personal injury, or fraud
          caused by our negligence.
        </Parag>
      </Section>

      <Section>
        <h2>10. Account Deletion</h2>
        <Parag>
          You may delete your account at any time from your account settings.
          The effects of deletion are described in the{' '}
          <Link to="/privacy-policy">Privacy Policy</Link>. We may also delete
          inactive accounts after an extended period of inactivity, with
          reasonable prior notice where possible.
        </Parag>
      </Section>

      <Section>
        <h2>11. Changes to the Service and These Terms</h2>
        <Parag>
          We may modify or discontinue the Service, or update these Terms, at
          any time. Material changes will be communicated by posting the updated
          version on this page with a revised "last updated" date. Continued use
          of the Service after changes are posted constitutes your acceptance of
          the revised Terms.
        </Parag>
      </Section>

      <Section>
        <h2>12. Governing Law</h2>
        <Parag>
          These Terms are governed by the laws of France, without regard to its
          conflict-of-law provisions. Any disputes shall be subject to the
          exclusive jurisdiction of the courts of Nice.
        </Parag>
      </Section>

      <Section>
        <h2>13. Contact</h2>
        <Parag>
          For any questions about these Terms, contact us at:
          <br />
          <strong>
            <em>no.rep.card.nest@gmail.com</em>
          </strong>
        </Parag>
      </Section>
    </ScrollablePage>
  );
}

export default TermsOfService;
