import styled from 'styled-components';

const Border = styled.div`
  width: 100%;
  background: #18120f;
  border-radius: 16px;
  overflow: visible;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  position: relative;
  outline: 1px solid rgba(217, 168, 90, 0.25);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.8),
    0 0 12px rgba(217, 168, 90, 0.15);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    outline: 1px solid rgba(240, 192, 106, 0.45);
    box-shadow: 0 0 22px rgba(240, 192, 106, 0.2);
    opacity: 0;
    animation: borderglow 2.5s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes borderglow {
    0%, 100% { opacity: 0; }
    50%       { opacity: 1; }
  }

  @media (max-width: 680px) {
    border-radius: 0;
    outline: none;
    box-shadow: none;
    overflow: hidden;
    max-width: 100%;
    height: 100svh;

    &::after {
      display: none;
    }
  }
`;

export default Border;
