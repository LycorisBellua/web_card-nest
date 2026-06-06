import { Link } from 'react-router-dom';
import type { PublicMsg, PrivateMsg } from 'context/Types';
import { GetTime } from 'functions/Time';
import { useUser } from 'context/useUser';
import { useSocket } from 'context/useSocket';
import { CanDisciplineThisUser } from 'functions/Ranks';
import styled, { css } from 'styled-components';
import { Avatar } from 'components/btn/Avatar';
import { Username } from 'components/btn/Username';
import { RankBadge } from 'components/btn/RankBadge';
import { BtnIcon } from 'components/btn/Btn';

const Row = styled.div<{ $rank: string }>`
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

  ${({ $rank }) => {
    switch ($rank) {
      case 'admin':
        return css`
          background: rgba(240, 192, 64, 0.04);
          box-shadow: inset 2px 0 0 rgba(240, 192, 64, 0.5);

          &:hover {
            background: rgba(240, 192, 64, 0.07);
          }
        `;
      case 'moderator':
        return css`
          background: rgba(212, 160, 112, 0.04);
          box-shadow: inset 2px 0 0 rgba(212, 160, 112, 0.4);

          &:hover {
            background: rgba(212, 160, 112, 0.08);
          }
        `;
      default:
        return '';
    }
  }}
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
`;

const Meta = styled.div`
  display: flex;
  align-items: baseline;
  gap: 7px;
  margin-bottom: 3px;
  flex-wrap: wrap;

  button {
    width: 20px;
    height: 20px;
  }
`;

const Time = styled.span`
  font-size: 0.58rem;
  color: #aa8a68;
`;

const NameWrap = styled.div<{ $rank: string }>`
  ${({ $rank }) => {
    switch ($rank) {
      case 'admin':
      case 'moderator':
        return css`
          display: flex;
          align-items: center;
          gap: 6px;
        `;
      default:
        return '';
    }
  }}

  a {
    text-decoration: none;
  }
`;

const Text = styled.div`
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  color: #d0a888;
  line-height: 1.62;
  white-space: pre-wrap;
  overflow-wrap: break-word;

  em {
    color: #f0c06a;
    font-style: normal;
  }
`;

const TextModerated = styled(Text)`
  font-style: italic;
`;

export function PublicChatMsg({ msg }: { msg: PublicMsg }) {
  const { user } = useUser();
  const { socket, onlineUsers } = useSocket();
  const is_logged_in = !!user && user.rank.toLowerCase() != 'pending';
  const can_discipline = CanDisciplineThisUser(
    user?.rank ?? '',
    msg.sender?.rank ?? '',
  );
  const isOnline = !!msg.sender && onlineUsers.has(msg.sender.id);
  const avatar = msg.sender?.avatar ?? '';
  const username = msg.sender?.username ?? 'Guest';
  const rank = (msg.sender?.rank ?? 'guest').toLowerCase();

  function handleModerate() {
    if (!user || !can_discipline) return;
    socket.emit('ModerateLobbyMessage', msg.id);
  }

  return (
    <Row $rank={rank}>
      {is_logged_in ? (
        <Link to={`/user/${username}`}>
          <Avatar src={avatar} rank={rank} isOnline={isOnline} />
        </Link>
      ) : (
        <Avatar src={avatar} rank={rank} isOnline={isOnline} />
      )}
      <Body>
        <Meta>
          <NameWrap $rank={rank}>
            {is_logged_in ? (
              <Link to={`/user/${username}`}>
                <Username rank={rank} value={username} />
              </Link>
            ) : (
              <Username rank={rank} value={username} />
            )}
            <RankBadge rank={rank} />
          </NameWrap>
          <Time>{GetTime(msg.date)}</Time>
          {can_discipline && !msg.moderated && (
            <BtnIcon title="Moderate" onClick={() => handleModerate()}>
              x
            </BtnIcon>
          )}
        </Meta>
        {msg.moderated ? (
          <TextModerated>Moderated message</TextModerated>
        ) : (
          <Text>{msg.message}</Text>
        )}
      </Body>
    </Row>
  );
}

export function PrivateChatMsg({ msg }: { msg: PrivateMsg }) {
  const { onlineUsers } = useSocket();
  const isOnline = !!msg.sender && onlineUsers.has(msg.sender.id);
  const avatar = msg.sender.avatar ?? '';
  const username = msg.sender.username;
  const rank = msg.sender.rank.toLowerCase();

  return (
    <Row $rank={rank}>
      <Link to={`/user/${username}`}>
        <Avatar src={avatar} rank={rank} isOnline={isOnline} />
      </Link>
      <Body>
        <Meta>
          <NameWrap $rank={rank}>
            <Link to={`/user/${username}`}>
              <Username rank={rank} value={username} />
            </Link>
            <RankBadge rank={rank} />
          </NameWrap>
          <Time>{GetTime(msg.date)}</Time>
        </Meta>
        <Text>{msg.message}</Text>
      </Body>
    </Row>
  );
}
