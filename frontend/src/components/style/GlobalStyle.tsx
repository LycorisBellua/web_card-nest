import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }

  #root {
    min-height: 100vh;
    color: #faf3f2;
    background-color: #242424;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  a {
    color: #faf3f2;
  }
`;

export default GlobalStyle;
