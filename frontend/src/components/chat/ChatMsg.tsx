import type { Msg } from 'context/Types';
import { GetTime } from 'functions/Time';
import { useUser } from 'context/useUser';
import styled, { css } from 'styled-components';
import { Avatar } from 'components/Avatar';
import Username from 'components/Username';

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
      case 'mod':
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
`;

const Time = styled.span`
  font-size: 0.58rem;
  color: #aa8a68;
`;

const NameWrap = styled.div<{ $rank: string }>`
  ${({ $rank }) => {
    switch ($rank) {
      case 'admin':
      case 'mod':
        return css`
          display: flex;
          align-items: center;
          gap: 6px;
        `;
      default:
        return '';
    }
  }}
`;

const RankBadge = styled.span<{ $rank: string }>`
  ${({ $rank }) => {
    switch ($rank) {
      case 'admin':
        return css`
          font-family: inherit;
          font-size: 0.55rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 1px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          color: #f5c842;
          background: rgba(240, 192, 64, 0.1);
          border: 1px solid rgba(240, 192, 64, 0.3);
          content: 'Admin';
        `;
      case 'mod':
        return css`
          font-family: inherit;
          font-size: 0.55rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 1px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          color: #c89050;
          background: rgba(212, 160, 112, 0.14);
          border: 1px solid rgba(212, 160, 112, 0.28);
          content: 'Mod';
        `;
      default:
        return '';
    }
  }}
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

function ChatMsg({ msg }: { msg: Msg }) {
  // TODO: Should a guest user be created (on the frontend only) instead of
  // doing this? We'll have the definitive answer once the guest profile page
  // is a thing.
  const { users } = useUser();
  const author = users.find((u) => u.id === msg.authorId) ?? null;

  const avatar = author?.avatar ?? '';
  const isOnline = author?.isOnline ?? false;
  const rank = author?.rank ?? 'guest';
  const username = author?.username ?? 'Guest';

  return (
    <Row $rank={rank}>
      <Avatar src={avatar} rank={rank} isOnline={isOnline} />
      <Body>
        <Meta>
          <NameWrap $rank={rank}>
            <Username rank={rank} value={username} />
            {(rank == 'admin' || rank == 'mod') && (
              <RankBadge $rank={rank}>{rank}</RankBadge>
            )}
          </NameWrap>
          <Time>{GetTime(msg.created)}</Time>
        </Meta>
        <Text>{msg.content}</Text>
      </Body>
    </Row>
  );
}

export default ChatMsg;
