import styled from 'styled-components';

const UsernameText = styled.div<{ $rank: string }>`
  text-align: left;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ $rank }) =>
    $rank == 'admin'
      ? '#f0d060'
      : $rank == 'moderator'
        ? '#d8b060'
        : '#e0c498'};
`;

const UsernameTextBig = styled.div<{ $rank: string }>`
  text-align: left;
  font-family: 'Quicksand', sans-serif;
  font-size: 1.26rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ $rank }) =>
    $rank == 'admin'
      ? '#f0d060'
      : $rank == 'moderator'
        ? '#d8b060'
        : '#e0c498'};
`;

export function Username({ rank, value }: { rank: string; value: string }) {
  return <UsernameText $rank={rank}>{value}</UsernameText>;
}

export function UsernameBig({ rank, value }: { rank: string; value: string }) {
  return <UsernameTextBig $rank={rank}>{value}</UsernameTextBig>;
}
