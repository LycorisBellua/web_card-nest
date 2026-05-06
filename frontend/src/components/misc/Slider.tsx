import { useState } from 'react';
import styled from 'styled-components';

/*
  <Slider textHeader="Volume" nbrMin={0} nbrMax={100} nbrStep={5} />
*/

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.74rem;
  color: #7a5c42;
  font-weight: 700;
`;

const Input = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  outline: none;
  background: rgba(212, 160, 96, 0.1);
  border: 1px solid #50382a;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    background: #d9a85a;
    border: 2px solid rgba(240, 192, 64, 0.4);
    box-shadow: 0 2px 8px rgba(212, 160, 96, 0.5);
    transition:
      background 0.15s,
      box-shadow 0.15s;
  }

  &::-webkit-slider-thumb:hover {
    background: #f0c06a;
    box-shadow: 0 3px 14px rgba(212, 160, 96, 0.7);
  }
`;

function Slider({
  textHeader,
  nbrMin,
  nbrMax,
  nbrStep,
}: {
  textHeader: string;
  nbrMin: number;
  nbrMax: number;
  nbrStep: number;
}) {
  const [value, setValue] = useState<number>(nbrMin);

  return (
    <Row>
      <Head>
        <span>{textHeader}</span>
        <span>{value}</span>
      </Head>
      <Input
        type="range"
        min={nbrMin}
        max={nbrMax}
        step={nbrStep}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </Row>
  );
}

export default Slider;
