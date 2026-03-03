import styled from 'styled-components';

export const Container = styled.div`
  max-width: 400px;
  margin: auto;
`;

export const FormGroup = styled.div`
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  input {
    height: 30px;
  }
  p {
    font-size: 12px;
    margin: 0;
  }
`;

export const ErrorText = styled.div`
  color: #ce4341;
  font-size: 12px;
  margin-bottom: 14px;
  p {
    margin: 0;
  }
`;

export const ButtonSubmitWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const SuccessMsg = styled.p`
  text-align: center;
  margin-top: 14px;
`;
