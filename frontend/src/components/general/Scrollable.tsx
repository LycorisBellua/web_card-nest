import styled from 'styled-components';

export const ScrollableArea = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #3a2a1e transparent;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #3a2a1e;
    border-radius: 3px;
  }
`;

export const ScrollablePage = styled(ScrollableArea)`
  padding: 1rem;
`;
