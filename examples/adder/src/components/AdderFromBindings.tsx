import React from 'react';
import { addTwoIntegers } from '../../bindings/adder_component';

export const AdderFromBindings: React.FC = () => {
  const [first, setFirst] = React.useState<number>(0);
  const [second, setSecond] = React.useState<number>(0);
  const [result, setResult] = React.useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sum = addTwoIntegers(first, second);
    setResult(sum);
  };

  return (
    <div style={{ border: '1px solid black', padding: '0 1rem' }}>
      <h1>Integer Adder using bindings</h1>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        onSubmit={handleSubmit}
      >
        <label>
          <span>First Number: &emsp;</span>
          <input
            type="number"
            value={first}
            style={{ width: '100px' }}
            onChange={(e) => setFirst(Number(e.target.value))}
          />
        </label>
        <label>
          <span>Second Number: &emsp;</span>
          <input
            type="number"
            value={second}
            style={{ width: '100px' }}
            onChange={(e) => setSecond(Number(e.target.value))}
          />
        </label>
        <button type="submit">Add</button>
      </form>
      <p>Sum: {result ?? '???'}</p>
    </div>
  );
};
