import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after
  {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html
  {
    font-size: clamp(16px, 0.8vw + 1.1vh, 22px);
    height: 100%;
    background: #090808;
    color: #d0a888;
  }

  body
  {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  #root
  {
    min-width: 300px;
	height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    padding: 20px;
    font-family: 'Quicksand', sans-serif;
    background: #090808;
  }

  @media (max-width: 680px)
  {
    html
    {
      font-size: 16px;
    }
    #root
    {
      padding: 0;
      min-height: 100svh;
      align-items: stretch;
    }
  }

  a {
    width: fit-content;
    color: #faf3f2;
  }

  ul {
    list-style-type: none;
  }

  ul > li:before {
    content: '-';
	padding-right: 4px;
  }
`;

export default GlobalStyle;
