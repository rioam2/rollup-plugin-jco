import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AdderFromBindings } from './AdderFromBindings';
import { $init } from '../../bindings/adder_component';
import { AdderFromImport } from './AdderFromImport';
import { AdderFromImportAsync } from './AdderFromImportAsync';

const ADDER_COMPONENTS = [
  ['AdderFromBindings', AdderFromBindings],
  ['AdderFromImport', AdderFromImport],
  ['AdderFromImportAsync', AdderFromImportAsync],
];

describe.for(ADDER_COMPONENTS)('%s Component', async ([, Component]) => {
  await $init;

  it('adds two positive numbers accurately', async () => {
    render(<Component />);

    const firstInput = screen.getByTestId('first-operand');
    const secondInput = screen.getByTestId('second-operand');
    const submitButton = screen.getByTestId('submit');

    fireEvent.change(firstInput, { target: { value: '5' } });
    fireEvent.change(secondInput, { target: { value: '7' } });
    fireEvent.click(submitButton);

    const result = screen.getByTestId('result');
    await waitFor(() => expect(result.textContent).toBe('12'));
  });

  it('adds a number with zero correctly', async () => {
    render(<Component />);

    const firstInput = screen.getByTestId('first-operand');
    const secondInput = screen.getByTestId('second-operand');
    const submitButton = screen.getByTestId('submit');

    fireEvent.change(firstInput, { target: { value: '0' } });
    fireEvent.change(secondInput, { target: { value: '10' } });
    fireEvent.click(submitButton);

    const result = screen.getByTestId('result');
    await waitFor(() => expect(result.textContent).toBe('10'));
  });

  it('adds two negative numbers correctly', async () => {
    render(<Component />);

    const firstInput = screen.getByTestId('first-operand');
    const secondInput = screen.getByTestId('second-operand');
    const submitButton = screen.getByTestId('submit');

    fireEvent.change(firstInput, { target: { value: '-4' } });
    fireEvent.change(secondInput, { target: { value: '-6' } });
    fireEvent.click(submitButton);

    const result = screen.getByTestId('result');
    await waitFor(() => expect(result.textContent).toBe('-10'));
  });
});
