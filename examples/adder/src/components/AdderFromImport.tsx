import React from 'react';
import { addTwoIntegers } from '../../bin/adder_component.wasm?component';
import { AdderUI } from './AdderUI';

export const AdderFromImport: React.FC = () => {
  return (
    <AdderUI
      title="Integer Adder using Import"
      handleSubmit={(a, b, setResult) => {
        // Directly call the imported addTwoIntegers function
        const sum = addTwoIntegers(a, b);
        setResult(sum);
      }}
    >
      This example demonstrates how to use the adder component by importing from
      the WebAssembly component directly using a Rollup/Vite plugin to transpile
      the component into Javascript during build-time. Typescript types are
      automatically generated and provide type safety against the imported API.
      This is the most user-friendly way to import WebAssembly Components
      without needing to know more about how to instrument the build-tooling
      yourself.
    </AdderUI>
  );
};
