import src_user from 'assets/default_user.png';
import src_guest from 'assets/default_guest.png';
import styled, { css } from 'styled-components';

const AvatarWrapper = styled.div<{ $big: boolean }>`
  position: relative;
  width: ${({ $big }) => ($big ? '7rem' : '1.75rem')};
  height: ${({ $big }) => ($big ? '7rem' : '1.75rem')};
  flex-shrink: 0;
`;

const AvatarImg = styled.img<{ $rank: string }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;

  ${({ $rank }) => {
    switch ($rank) {
      case 'guest':
        return css`
          filter: brightness(0) invert(1);
        `;
      default:
        return '';
    }
  }}
`;

const StatusDot = styled.div<{ $big: boolean; $isOnline: boolean }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: ${({ $big }) => ($big ? '1.76rem' : '0.44rem')};
  height: ${({ $big }) => ($big ? '1.76rem' : '0.44rem')};
  border-radius: 50%;
  border: ${({ $big }) => ($big ? '6px' : '2px')} solid #0e0a08;
  background: ${({ $isOnline }) => ($isOnline ? '#6aaa5a' : '#8f8f8f')};
`;

export function Avatar({
  src,
  rank,
  isOnline,
}: {
  src: string;
  rank: string;
  isOnline: boolean;
}) {
  const final_src = src ? src : rank == 'guest' ? src_guest : src_user;

  return (
    <AvatarWrapper $big={false}>
      <AvatarImg src={final_src} alt="avatar" $rank={rank} />
      <StatusDot $big={false} $isOnline={isOnline} />
    </AvatarWrapper>
  );
}

export function AvatarBig({
  src,
  rank,
  isOnline,
}: {
  src: string;
  rank: string;
  isOnline: boolean;
}) {
  const final_src = src ? src : rank == 'guest' ? src_guest : src_user;

  return (
    <AvatarWrapper $big={true}>
      <AvatarImg src={final_src} alt="avatar" $rank={rank} />
      <StatusDot $big={true} $isOnline={isOnline} />
    </AvatarWrapper>
  );
}
