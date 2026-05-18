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
          content: 'Admin';
        `;
      case 'mod':
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
          content: 'Mod';
        `;
      default:
        return '';
    }
  }}
`;

export function RankBadge({ rank }: { rank: string }) {
  if (rank == 'admin' || rank == 'mod') {
    return <Badge $rank={rank}>{rank}</Badge>;
  }
  return <></>;
}

export function RankBadgeBig({ rank }: { rank: string }) {
  if (rank == 'admin' || rank == 'mod') {
    return <BadgeBig $rank={rank}>{rank}</BadgeBig>;
  }
  return <></>;
}
