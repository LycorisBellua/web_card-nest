import type { PropsWithChildren } from 'react';
import styled from 'styled-components';

export const BtnDefault = styled.button`
  margin: 2px;
  padding: 9px 18px;
  cursor: pointer;
  border-radius: 10px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #e0c498;
  background: rgba(212, 160, 96, 0.07);
  border: 1px solid #50382a;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  transition:
    background 0.15s,
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.1s;

  &:hover {
    background: rgba(212, 160, 96, 0.13);
    border-color: rgba(212, 160, 96, 0.35);
    box-shadow: 0 5px 16px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: scale(0.96);
    background: rgba(212, 160, 96, 0.18);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export const BtnAccent = styled(BtnDefault)`
  background: rgba(212, 160, 96, 0.14);
  border-color: rgba(212, 160, 96, 0.35);
  color: #f0c06a;

  &:hover {
    background: rgba(212, 160, 96, 0.22);
    border-color: rgba(212, 160, 96, 0.55);
    box-shadow: 0 5px 16px rgba(212, 160, 96, 0.2);
  }
`;

export const BtnDanger = styled(BtnDefault)`
  color: #d07070;
  border-color: rgba(200, 104, 104, 0.25);
  background: rgba(200, 104, 104, 0.08);

  &:hover {
    background: rgba(200, 104, 104, 0.15);
    border-color: rgba(200, 104, 104, 0.4);
  }
`;

export const BtnGhost = styled(BtnDefault)`
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  color: #aa8a68;

  &:hover {
    background: rgba(212, 160, 96, 0.06);
    border-color: #3a2a1e;
  }
`;

export const BtnIcon = styled.button`
  width: 48px;
  height: 48px;
  border: 1px solid #50382a;
  cursor: pointer;
  border-radius: 12px;
  background: #221a14;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7a5c42;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s,
    transform 0.1s;

  &:hover {
    background: rgba(212, 160, 96, 0.1);
    border-color: rgba(212, 160, 96, 0.3);
    color: #d9a85a;
  }

  &:active {
    transform: scale(0.9);
  }
`;

type BtnDefaultProps = React.ComponentProps<typeof BtnDefault>;
export function BtnDisabled({
  children,
  ...props
}: PropsWithChildren<BtnDefaultProps>) {
  return (
    <BtnDefault disabled {...props}>
      {children}
    </BtnDefault>
  );
}
