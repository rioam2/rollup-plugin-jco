import React from 'react';
import { addTwoIntegers } from '../../bindings/adder_component';
import { AdderUI } from './AdderUI';

export const AdderFromBindings: React.FC = () => {
  return (
    <AdderUI
      title="Integer Adder using bindings"
      handleSubmit={(a, b, setResult) => {
        // Directly call the imported addTwoIntegers function
        const result = addTwoIntegers(a, b);
        setResult(result);
      }}
    >
      This example demonstrates how to use the adder component by importing the
      transpiled bindings from a directory in your project. This is the most
      transparent and idiomatic way to use WebAssembly Components.
    </AdderUI>
  );
};
