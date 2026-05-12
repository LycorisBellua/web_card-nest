import styled from 'styled-components';
import { BtnDefault, BtnDanger } from 'components/btn/Btn';

/*
  const [isModalOpen, setIsModalOpen] = useState(false);

  <Modal
    isOpen={isModalOpen}
    onCancel={() => setIsModalOpen(false)}
    onConfirm={() => setIsModalOpen(false)}
    title="Leave table?"
    textMain="If you leave mid-game, the result will be recorded as a loss and your opponent will be awarded the win. This action cannot be undone."
    textCancel="Stay"
    textConfirm="Leave anyway"
  />
*/

const ModalBackdrop = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(8, 5, 3, 0.65);
  backdrop-filter: blur(6px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'all' : 'none')};
  transition: opacity 0.22s;
`;

const ModalWindow = styled.div<{ $isOpen: boolean }>`
  width: min(420px, 90vw);
  background: #1e1410;
  border: 1px solid #50382a;
  border-radius: 22px;
  padding: 30px;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(212, 160, 96, 0.05);
  transform: ${({ $isOpen }) =>
    $isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(10px)'};
  transition: transform 0.28s cubic-bezier(0.34, 1.36, 0.64, 1);
`;

const ModalHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
`;

const ModalTitle = styled.h3`
  font-family: 'Epilogue', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  color: #f0c06a;
`;

const ModalBtnClose = styled.button`
  width: 30px;
  height: 30px;
  border: 1px solid #50382a;
  cursor: pointer;
  border-radius: 8px;
  background: #221a14;
  font-size: 13px;
  color: #7a5c42;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;

  &:hover {
    color: #d07070;
    background: rgba(200, 104, 104, 0.1);
    border-color: rgba(200, 104, 104, 0.3);
  }
`;

const ModalText = styled.p`
  font-size: 0.82rem;
  color: #7a5c42;
  margin-bottom: 22px;
  line-height: 1.65;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

function Modal({
  isOpen,
  onCancel,
  onConfirm,
  title,
  textMain,
  textCancel,
  textConfirm,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  textMain: string;
  textCancel: string;
  textConfirm: string;
}) {
  return (
    <ModalBackdrop $isOpen={isOpen}>
      <ModalWindow $isOpen={isOpen}>
        <ModalHead>
          <ModalTitle>{title}</ModalTitle>
          <ModalBtnClose onClick={onCancel}>✕</ModalBtnClose>
        </ModalHead>
        <ModalText>{textMain}</ModalText>
        <ModalActions>
          <BtnDefault onClick={onCancel}>{textCancel}</BtnDefault>
          <BtnDanger onClick={onConfirm}>{textConfirm}</BtnDanger>
        </ModalActions>
      </ModalWindow>
    </ModalBackdrop>
  );
}

export default Modal;
