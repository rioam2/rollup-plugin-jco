# Vite + React Adder WASI Component Example

This example demonstrates how to use the `rollup-plugin-jco` plugin to transpile a WebAssembly (WASI) component to a JavaScript module that can be imported into a React + Vite project.

The example WebAssembly component is a simple adder that takes two integer numbers and returns the sum. The component is written in C++ and compiled to WebAssembly using the `wasi-sdk` toolchain [here](https://github.com/rioam2/wasi-sdk-toolchain).

The project can be run from the repository root using the following command:

```bash
npm run dev
```

The project will start a Vite development server on `http://localhost:3000`. The adder component will be imported into the `App.tsx` file and the sum of two numbers can be calculated in the UI.

Some very basic tests are also included and can be run using the following command:

```bash
npm run test
```