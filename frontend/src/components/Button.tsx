import styled from 'styled-components';

/*
    // sync nav active state
    function syncNav(key) {
      document
        .querySelectorAll('.nav-btn')
        .forEach((b) => b.classList.toggle('on', b.dataset.nav === key));
    }
    document
      .querySelectorAll('.nav-btn')
      .forEach((b) =>
        b.addEventListener('click', () => syncNav(b.dataset.nav)),
      );

  :hover {
    background: rgba(212, 160, 112, 0.09);
    color: #e0c498;
  }

      .on {
        background: rgba(212, 160, 112, 0.16);
        color: #f0c06a;
      }
*/

const Button = styled.button`
  font: inherit;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  text-align: left;

  padding: 5px 10px;
  border-radius: 8px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: #aa8a68;
  background: transparent;
  border: none;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  white-space: nowrap;

  background: rgba(212, 160, 112, 0.16);
  color: #f0c06a;
`;

export default Button;
