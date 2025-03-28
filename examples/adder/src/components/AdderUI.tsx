import React from 'react';

export interface AdderUIProps extends React.PropsWithChildren {
  title: string;
  handleSubmit: (
    a: number,
    b: number,
    setResult: (result: number) => void,
  ) => void;
}

export const AdderUI: React.FC<AdderUIProps> = ({
  title,
  handleSubmit,
  children,
}) => {
  const [first, setFirst] = React.useState<number>(0);
  const [second, setSecond] = React.useState<number>(0);
  const [result, setResult] = React.useState<number | null>(null);

  return (
    <div
      style={{ border: '1px solid black', padding: '0 1rem', flex: '1 0 0' }}
    >
      <h1>{title}</h1>
      <p>{children}</p>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(first, second, setResult);
        }}
      >
        <label>
          <span>First Number: &emsp;</span>
          <input
            type="number"
            data-testid="first-operand"
            value={first}
            style={{ width: '100px' }}
            onChange={(e) => setFirst(Number(e.target.value))}
          />
        </label>
        <label>
          <span>Second Number: &emsp;</span>
          <input
            type="number"
            data-testid="second-operand"
            value={second}
            style={{ width: '100px' }}
            onChange={(e) => setSecond(Number(e.target.value))}
          />
        </label>
        <button data-testid="submit" type="submit">
          Add
        </button>
      </form>
      <p>
        <strong>
          Sum: <span data-testid="result">{result ?? '???'}</span>
        </strong>
      </p>
    </div>
  );
};
