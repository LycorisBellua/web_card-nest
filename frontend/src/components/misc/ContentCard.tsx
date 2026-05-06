import styled from 'styled-components';
import BtnAccent from 'components/btn/BtnAccent';

/*
  <ContentCard
    title="Black Crown basics"
    content="A quick guide to how Black Crown works: hands, rules, and how to play with friends."
  />
*/

const Card = styled.div`
  background: #221a14;
  border: 1px solid #50382a;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
`;

const Thumb = styled.div`
  height: 90px;
  margin: 10px 10px 0;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(200, 112, 80, 0.15),
    rgba(176, 144, 216, 0.12)
  );
  border: 1px solid #50382a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
`;

const BodyBlock = styled.div`
  padding: 14px;
`;

const BodyTitle = styled.h4`
  font-family: 'Epilogue', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  margin-bottom: 4px;
  color: #f0c06a;
`;

const BodyText = styled.p`
  font-size: 0.74rem;
  color: #7a5c42;
  margin-bottom: 12px;
  line-height: 1.55;
`;

const Foot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  button {
    padding: 5px 13px;
    font-size: 0.72rem;
  }
`;

function ContentCard({ title, content }: { title: string; content: string }) {
  return (
    <Card>
      <Thumb>🃏</Thumb>
      <BodyBlock>
        <BodyTitle>{title}</BodyTitle>
        <BodyText>{content}</BodyText>
        <Foot>
          <BtnAccent>Read →</BtnAccent>
        </Foot>
      </BodyBlock>
    </Card>
  );
}

export default ContentCard;
