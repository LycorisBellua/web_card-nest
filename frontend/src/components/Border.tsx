import styled from 'styled-components';

const Border = styled.div`
  width: 100%;
  background: #18120f;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  animation: borderglow 2.5s ease-in-out infinite;

  @keyframes borderglow {
    0%,
    100% {
      box-shadow:
        0 40px 100px rgba(0, 0, 0, 0.8),
        0 0 0 1px rgba(217, 168, 90, 0.25),
        0 0 12px rgba(217, 168, 90, 0.15);
    }
    50% {
      box-shadow:
        0 40px 100px rgba(0, 0, 0, 0.8),
        0 0 0 1px rgba(240, 192, 106, 0.7),
        0 0 22px rgba(240, 192, 106, 0.35);
      }
  }

  @media (max-width: 680px) {
    border-radius: 0;
    box-shadow: none;
    animation: none;
    max-width: 100%;
    height: 100svh;
  }
`;

export default Border;
