import React from 'react';
import { AdderUI } from './AdderUI';

/**
 * This function is used to load the core module of the adder WASM component.
 * This is only required for lazy loading a WASM component using async instantiation.
 * If the WebAssembly component is comprised of multiple modules, this function
 * should return the core module of each according to name.
 * @param name The name of the core module to load.
 * @returns The compiled core module of the adder WASM component.
 */
const getCoreModule = async (name: string) => {
  switch (name) {
    case 'adder_component.wasm.core.wasm':
      const core = await import('../../bin/adder_component.wasm?core=0');
      return core.compile();
    // Add more cases here if your WASM component has multiple core modules.
    default:
      throw new Error('Unexpected module name');
  }
};

/**
 * This function is used to initialize the adder component using async instantiation.
 * It lazily loads the adder component and returns an instance of the adder API.
 */
const instantiateAdderComponent = async () => {
  const { instantiate } = await import(
    '../../bin/adder_component.wasm?component&instantiation=async'
  );
  return instantiate(getCoreModule, {});
};

export const AdderFromImportAsync: React.FC = () => {
  return (
    <AdderUI
      title="Integer Adder using Import (Async Instantiation)"
      handleSubmit={async (a, b, setResult) => {
        // Ideally this instantiation should be done once and cached.
        // This is just for demonstration purposes.
        const { addTwoIntegers } = await instantiateAdderComponent();
        const sum = addTwoIntegers(a, b);
        setResult(sum);
      }}
    >
      This example demonstrates how to use the adder component by importing from
      the WebAssembly component directly using a Rollup/Vite plugin to transpile
      the component into Javascript during build-time. Typescript types are
      automatically generated and provide type safety against the imported API.
      This example uses async instantiation to lazily load the adder component.
      This improves the initial load time of the application by only loading the
      adder component when it is needed.
    </AdderUI>
  );
};
