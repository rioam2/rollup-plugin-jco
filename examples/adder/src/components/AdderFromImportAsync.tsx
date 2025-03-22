import React from 'react';
import { instantiate } from '../../bin/adder_component.wasm?component&instantiation=async';

export const AdderFromImportAsync: React.FC = () => {
  const [first, setFirst] = React.useState<number>(0);
  const [second, setSecond] = React.useState<number>(0);
  const [result, setResult] = React.useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cores = await import('../../bin/adder_component.wasm?cores');
    const { addTwoIntegers } = await instantiate(cores.getCoreModule, {});
    const sum = addTwoIntegers(first, second);
    setResult(sum);
  };

  return (
    <div style={{ border: '1px solid black', padding: '0 1rem' }}>
      <h1>Integer Adder using Import (Async Instantiation)</h1>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        onSubmit={handleSubmit}
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
        Sum: <span data-testid="result">{result ?? '???'}</span>
      </p>
    </div>
  );
};
