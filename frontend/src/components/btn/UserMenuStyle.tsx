import styled from 'styled-components';

export const Wrapper = styled.div`
  position: relative;
`;

export const Menu = styled.div<{ $open: boolean }>`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 50;
  background: #1e1410;
  border: 1px solid #50382a;
  border-radius: 12px;
  overflow: hidden;
  max-height: ${({ $open }) => ($open ? '220px' : '0')};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? 'all' : 'none')};
  transition:
    max-height 0.25s ease,
    opacity 0.18s;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
`;

export const Option = styled.button<{ $destructive?: boolean }>`
  width: 100%;
  padding: 10px 16px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 1px solid #3a2a1e;
  text-align: left;
  transition: background 0.12s;
  color: ${({ $destructive }) => ($destructive ? '#c0624a' : '#aa8a68')};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(212, 160, 96, 0.08);
    color: ${({ $destructive }) => ($destructive ? '#e07055' : '#e0c498')};
  }
`;
