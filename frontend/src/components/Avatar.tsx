import styled from 'styled-components';

const AvatarWrapper = styled.div`
  position: relative;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
`;

const StatusDot = styled.div<{ $isOnline: boolean }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.44rem;
  height: 0.44rem;
  border-radius: 50%;
  border: 2px solid #0e0a08;
  background: ${({ $isOnline }) => ($isOnline ? '#6aaa5a' : '#8f8f8f')};
`;

function Avatar({ src, isOnline }: { src: string; isOnline: boolean }) {
  return (
    <AvatarWrapper>
      <AvatarImg src={src} alt="avatar" />
      <StatusDot $isOnline={isOnline} />
    </AvatarWrapper>
  );
}

export default Avatar;
