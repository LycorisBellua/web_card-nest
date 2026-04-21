import { GetDate, GetTime } from 'functions/Time';
import Avatar from 'components/Avatar';
import Username from 'components/Username';
import styled from 'styled-components';

// TODO: Elements within Chat should take all the available width
const Chat = styled.div`
`;

const ChatHead = styled.div`
  padding: 10px 16px;
  border-bottom: 1px solid #38281a;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  @media (max-height: 620px) {
    padding: 7px 14px;
  }
`;

const ChatTitle = styled.div`
  font-family: inherit;
  font-weight: 700;
  color: #d9a85a;
  font-size: 0.88rem;
`;

const ChatSub = styled.div`
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  color: #b08060;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const LiveDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #d9a85a;
  animation: pulse 2.5s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
      box-shadow: 0 0 0 0 rgba(212, 160, 112, 0.3);
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 0 4px rgba(212, 160, 112, 0);
    }
  }
`;

// TODO: Does the scrollbar work?
const Msgs = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  scrollbar-width: thin;
  scrollbar-color: #3a2a1e transparent;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #3a2a1e;
    border-radius: 3px;
  }

  @media (max-height: 620px) {
    padding: 8px 14px;
  }
`;

const SysMsg = styled.div`
  text-align: center;
  font-family: inherit;
  font-size: 0.62rem;
  font-weight: 700;
  color: #aa8a68;
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #3a2a1e;
  }
`;

const MsgRow = styled.div`
  display: flex;
  gap: 10px;
  padding: 5px 6px;
  border-radius: 10px;
  transition: background 0.12s;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  &:hover {
    background: rgba(212, 160, 112, 0.05);
  }
`;

const AdminMsgRow = styled(MsgRow)`
  background: rgba(240, 192, 64, 0.04);
  box-shadow: inset 2px 0 0 rgba(240, 192, 64, 0.5);

  &:hover {
    background: rgba(240, 192, 64, 0.07);
    box-shadow: inset 2px 0 0 rgba(240, 192, 64, 0.5);
  }
`;

const ModMsgRow = styled(MsgRow)`
  background: rgba(212, 160, 112, 0.04);
  box-shadow: inset 2px 0 0 rgba(212, 160, 112, 0.4);

  &:hover {
    background: rgba(212, 160, 112, 0.08);
    box-shadow: inset 2px 0 0 rgba(212, 160, 112, 0.4);
  }
`;

const MsgBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const MsgMeta = styled.div`
  display: flex;
  align-items: baseline;
  gap: 7px;
  margin-bottom: 3px;
  flex-wrap: wrap;
`;

const MsgTime = styled.span`
  font-size: 0.58rem;
  color: #aa8a68;
`;

const ModNameWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AdminBadge = styled.span`
  font-family: inherit;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #f5c842;
  background: rgba(240, 192, 64, 0.1);
  border: 1px solid rgba(240, 192, 64, 0.3);
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
`;

const ModBadge = styled.span`
  font-family: inherit;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #c89050;
  background: rgba(212, 160, 112, 0.14);
  border: 1px solid rgba(212, 160, 112, 0.28);
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
`;

const MsgText = styled.div`
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  color: #d0a888;
  line-height: 1.62;

  em {
    color: #f0c06a;
    font-style: normal;
  }
`;

const EventCard = styled.div`
  margin: 8px 0;
  background: rgba(176, 144, 216, 0.07);
  border: 1px solid rgba(176, 144, 216, 0.18);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
  container-type: inline-size;

  span {
    font-size: 1rem;
  }
`;

const EventText = styled.div`
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  color: #d0a888;
  flex: 1;
  line-height: 1.45;
  min-width: 0;

  strong {
    color: #c8a0e8;
  }

  @container (max-width: 300px) {
    width: 100%;
  }
`;

const EventCardBtns = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;

  @container (max-width: 300px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const EventWatchBtn = styled.button`
  background: transparent;
  color: #b090d8;
  border: 1px solid rgba(176, 144, 216, 0.35);
  border-radius: 8px;
  padding: 5px 10px;
  font-family: inherit;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  &:hover {
    background: rgba(176, 144, 216, 0.1);
    border-color: rgba(176, 144, 216, 0.55);
    color: #c8a8f0;
  }
`;

const EventJoinBtn = styled.button`
  background: linear-gradient(135deg, #9060c0, #b090d8);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(144, 96, 192, 0.35);
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(144, 96, 192, 0.45);
  }
`;

const InputWrap = styled.div`
  padding: 10px 14px 12px;
  border-top: 1px solid #38281a;
  flex-shrink: 0;

  @media (max-height: 620px) {
    padding: 7px 12px 8px;
  }
`;

const InputBox = styled.div`
  background: #0e0a08;
  border: 1px solid #3a2a1e;
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: rgba(212, 160, 112, 0.35);
  }
`;

const InputField = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  color: #c09070;
  min-width: 0;

  &::placeholder {
    color: #533d2c;
  }
`;

const InputSend = styled.button`
  background: linear-gradient(135deg, #d9a85a, #8b4820);
  border: none;
  border-radius: 0.5rem;
  width: 1.875rem;
  height: 1.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.75rem;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(180, 100, 50, 0.4);
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 5px 16px rgba(180, 100, 50, 0.5);
  }
`;

function Lobby() {
   // TODO: Remove this temporary data
   const total_online = 42;
   const users = [
      {
        username: 'Espresso',
        avatar:
          'https://pics.craiyon.com/2023-11-16/Gf0MaOtPQDeq60d49Ai6uA.webp',
        rank: 'user',
        isOnline: true,
      },
      {
        username: 'Jookebox',
        avatar:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR_uvplX64OVu7oEysYZ5HjfMVUgjb9LEzEllowZk8UA&s',
        rank: 'admin',
        isOnline: true,
      },
      {
        username: 'Lumière',
        avatar:
          'https://college.taylors.edu.my/content/dam/taylorsrevamp/college/student-life/news-and-articles/2024/shadows-in-the-candles-glow-bringing-sustainability-to-light/taylors-article-shadows-in-the-candles-glow-hero-banner-mobile-768x650.png/jcr:content/renditions/cq5dam.web.768.650.webp',
        rank: 'user',
        isOnline: false,
      },
      {
        username: 'MuffinTop',
        avatar:
          'https://www.shutterstock.com/image-photo/kawaiistyle-chocolate-muffin-smiling-big-600nw-2758545531.jpg',
        rank: 'user',
        isOnline: true,
      },
      {
        username: 'Sagewick',
        avatar:
          'https://static.vecteezy.com/ti/vecteur-libre/p1/43511509-cerise-fleurs-illustration-vectoriel.jpg',
        rank: 'mod',
        isOnline: false,
      },
      {
        username: 'Tealeaf',
        avatar:
          'https://thumbs.dreamstime.com/b/cute-kawaii-teapot-cartoon-floral-accent-illustration-cheerful-yellow-pink-lid-teal-handle-adorned-flower-style-445328393.jpg',
        rank: 'mod',
        isOnline: false,
      },
   ];
   const posts = [
      {
         created: new Date('April 19, 2026 21:14:32'),
         content: "good evening everyone ☕ rain's coming down outside. perfect night to stay in and play some cards?",
      },
      {
         created: new Date('April 19, 2026 21:16:41'),
         content: "this place is so cozy!! I literally just stumbled in but I think I'll be staying a while 🥹",
      },
      {
         created: new Date('April 19, 2026 21:17:18'),
         content: "welcome lumiere 🕯️ glad you found us. make yourself at home - the lobby is always open.",
      },
      {
         created: new Date('April 19, 2026 21:19:01'),
         content: "Lumière come join, no pressure at all. Jookebox put some lo-fi on too so the vibes are immaculate rn",
      },
      {
         created: new Date('April 19, 2026 21:21:21'),
         content: "saving me a seat?? 🙏 be there in 5",
      },
      {
         created: new Date('April 19, 2026 21:22:23'),
         content: "always 🧁 also just queued two more hours of lo-fi so we're set for the night ✨",
      },
   ];
   //---
   /*
      TODO
      - Currently, the date is hardcoded to be the one of the first post, 
      instead of showing every new day of posts.
   */

  return (
    <Chat>
      <ChatHead>
        <div>
          <ChatTitle># the lobby</ChatTitle>
          <ChatSub><LiveDot></LiveDot>{total_online} online</ChatSub>
        </div>
      </ChatHead>

      <Msgs>
        <SysMsg>{GetDate(posts[0].created)}</SysMsg>

        <MsgRow>
          <Avatar src={users[0].avatar} isOnline={users[0].isOnline} />
          <MsgBody>
            <MsgMeta>
              <Username rank={users[0].rank} value={users[0].username} />
              <MsgTime>{GetTime(posts[0].created)}</MsgTime>
            </MsgMeta>
            <MsgText>{posts[0].content}</MsgText>
          </MsgBody>
        </MsgRow>

        <MsgRow>
          <Avatar src={users[2].avatar} isOnline={users[2].isOnline} />
          <MsgBody>
            <MsgMeta>
              <Username rank={users[2].rank} value={users[2].username} />
              <MsgTime>{GetTime(posts[1].created)}</MsgTime>
            </MsgMeta>
            <MsgText>{posts[1].content}</MsgText>
          </MsgBody>
        </MsgRow>

        <ModMsgRow>
          <Avatar src={users[4].avatar} isOnline={users[4].isOnline} />
          <MsgBody>
            <MsgMeta>
              <ModNameWrap>
                <Username rank={users[4].rank} value={users[4].username} />
                <ModBadge>Mod</ModBadge>
              </ModNameWrap>
              <MsgTime>{GetTime(posts[2].created)}</MsgTime>
            </MsgMeta>
            <MsgText>{posts[2].content}</MsgText>
          </MsgBody>
        </ModMsgRow>

        <EventCard>
          <span>🃏</span>
          <EventText>
            <strong>{users[5].username}</strong> and <strong>{users[1].username}</strong> have a Black Crown table going · 2 seats free
          </EventText>
          <EventCardBtns>
            <EventWatchBtn>Watch</EventWatchBtn>
            <EventJoinBtn>Join</EventJoinBtn>
          </EventCardBtns>
        </EventCard>

        <MsgRow>
          <Avatar src={users[5].avatar} isOnline={users[5].isOnline} />
          <MsgBody>
            <MsgMeta>
              <Username rank={users[5].rank} value={users[5].username} />
              <MsgTime>{GetTime(posts[3].created)}</MsgTime>
            </MsgMeta>
            <MsgText>{posts[3].content}</MsgText>
          </MsgBody>
        </MsgRow>

        <MsgRow>
          <Avatar src={users[3].avatar} isOnline={users[3].isOnline} />
          <MsgBody>
            <MsgMeta>
              <Username rank={users[3].rank} value={users[3].username} />
              <MsgTime>{GetTime(posts[4].created)}</MsgTime>
            </MsgMeta>
            <MsgText>{posts[4].content}</MsgText>
          </MsgBody>
        </MsgRow>

        <AdminMsgRow>
          <Avatar src={users[1].avatar} isOnline={users[1].isOnline} />
          <MsgBody>
            <MsgMeta>
              <ModNameWrap>
                <Username rank={users[1].rank} value={users[1].username} />
                <AdminBadge>Admin</AdminBadge>
              </ModNameWrap>
              <MsgTime>{GetTime(posts[5].created)}</MsgTime>
            </MsgMeta>
            <MsgText>{posts[5].content}</MsgText>
          </MsgBody>
        </AdminMsgRow>

      </Msgs>

      <InputWrap>
        <InputBox>
          <InputField placeholder="Say something..." />
          <InputSend>➤</InputSend>
        </InputBox>
      </InputWrap>

    </Chat>
  );
}

export default Lobby;
