import styled from 'styled-components';

/*
  <TextareaField
    id="email"
    type="text"
    name="email"
    label="Email"
    placeholder="john.doe@domain.com"
    value={value}
    onChange={(e) => {
      setValue(e.target.value);
      onChange(e.target.value);
    }}
    helpers={['Please enter a valid email address']}
    isError={true}
    autoComplete="off"
    rows={4}
    wrap="soft"
  />
*/

const Wrapper = styled.div`
  margin: 8px 0px 8px 0px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-family: 'Epilogue', sans-serif;
  font-size: 0.62rem;
  font-weight: 800;
  color: #7a5c42;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const Field = styled.textarea<{ $isError: boolean }>`
  width: 100%;
  padding: 10px 13px;
  border: 1px solid #50382a;
  outline: none;
  border-radius: 10px;
  font-family: 'Quicksand', sans-serif;
  font-size: 0.84rem;
  font-weight: 600;
  color: #e0c498;
  background: #221a14;
  border-color: ${({ $isError }) =>
    $isError ? 'rgba(200, 104, 104, 0.45)' : '#50382a'};
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &::placeholder {
    color: #533d2c;
  }

  &:focus {
    border-color: ${({ $isError }) =>
      $isError ? 'rgba(200, 104, 104, 0.4)' : 'rgba(212, 160, 96, 0.4)'};
    box-shadow:
      inset 0 2px 6px rgba(0, 0, 0, 0.3),
      ${({ $isError }) =>
        $isError
          ? '0 0 0 3px rgba(200, 104, 104, 0.1)'
          : '0 0 0 3px rgba(212, 160, 96, 0.1)'};
  }
`;

const Helper = styled.span<{ $isError: boolean }>`
  font-size: 0.68rem;
  color: ${({ $isError }) => ($isError ? '#d07070' : '#7a5c42')};
`;

function TextareaField({
  id,
  value,
  onChange,
  name,
  placeholder,
  autoComplete,
  label,
  rows,
  wrap,
  helpers,
  isError = false,
}: {
  id: string;
  value: string;
  onChange: (val: React.ChangeEvent<HTMLTextAreaElement>) => void;
  name: string;
  placeholder: string;
  autoComplete?: string;
  label: string;
  rows: number;
  wrap: string;
  helpers?: string[];
  isError?: boolean;
}) {
  return (
    <Wrapper>
      <Label htmlFor={id}>{label}</Label>
      <Field
        $isError={isError}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e)}
        autoComplete={autoComplete ?? 'off'}
        rows={rows}
        wrap={wrap}
      />
      {helpers?.map((e) => (
        <Helper key={e} $isError={isError}>
          {e}
        </Helper>
      ))}
    </Wrapper>
  );
}

export default TextareaField;
