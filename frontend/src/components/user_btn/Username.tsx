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
    $rank == 'admin' ? '#f0d060' : $rank == 'mod' ? '#d8b060' : '#e0c498'};
`;

function Username({ rank, value }: { rank: string; value: string }) {
  return <UsernameText $rank={rank}>{value}</UsernameText>;
}

export default Username;
