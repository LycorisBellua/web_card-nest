import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html, body {
    height: 100%;
    margin: 0;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #faf3f2;
    background-color: #242424;
  }

  a {
    color: #faf3f2;
  }
`;

export default GlobalStyle;
