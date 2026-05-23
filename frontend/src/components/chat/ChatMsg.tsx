import { Link } from 'react-router-dom';
import type { UserLimited, Msg } from 'context/Types';
import { GetTime } from 'functions/Time';
import { useUser } from 'context/useUser';
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

function ChatMsg({ msg }: { msg: Msg }) {
  const { user } = useUser();
  const author: UserLimited = null; //TODO
  //const author = users.find((u) => u.id === msg.authorId) ?? null;
  const can_discipline = CanDisciplineThisUser(user, author);

  const avatar = author?.avatar ?? '';
  const isOnline = author?.isOnline ?? false;
  const rank = author?.rank ?? 'guest';
  const username = author?.username ?? 'Guest';
  const is_logged_in = !!user && user.rank.toLowerCase() != 'pending';

  // TODO: When clicking on Moderate, make the msg content empty, and switch
  // the `moderated` field to true

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
          <Time>{GetTime(msg.created)}</Time>
          {can_discipline && <BtnIcon title="Moderate">x</BtnIcon>}
        </Meta>
        {msg.moderated ? (
          <TextModerated>Moderated message</TextModerated>
        ) : (
          <Text>{msg.content}</Text>
        )}
      </Body>
    </Row>
  );
}

export default ChatMsg;
