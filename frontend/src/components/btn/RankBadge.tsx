import styled, { css } from 'styled-components';

const Badge = styled.span<{ $rank: string }>`
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
        `;
      case 'moderator':
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
        `;
      default:
        return '';
    }
  }}
`;

const BadgeBig = styled.span<{ $rank: string }>`
  ${({ $rank }) => {
    switch ($rank) {
      case 'admin':
        return css`
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 1px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          color: #f5c842;
          background: rgba(240, 192, 64, 0.1);
          border: 1px solid rgba(240, 192, 64, 0.3);
        `;
      case 'moderator':
        return css`
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 1px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          color: #c89050;
          background: rgba(212, 160, 112, 0.14);
          border: 1px solid rgba(212, 160, 112, 0.28);
        `;
      default:
        return '';
    }
  }}
`;

export function RankBadge({ rank }: { rank: string }) {
  rank = rank.toLowerCase();
  if (rank == 'admin' || rank == 'moderator') {
    return <Badge $rank={rank}>{rank == 'moderator' ? 'mod' : rank}</Badge>;
  }
  return <></>;
}

export function RankBadgeBig({ rank }: { rank: string }) {
  rank = rank.toLowerCase();
  if (rank == 'admin' || rank == 'moderator') {
    return (
      <BadgeBig $rank={rank}>{rank == 'moderator' ? 'mod' : rank}</BadgeBig>
    );
  }
  return <></>;
}
