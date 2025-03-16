# rollup-plugin-jco

A plugin for [Rollup](https://rollupjs.org) that allows you to easily import WebAssembly (WASI) components into your JavaScript code bundled with Rollup or Vite. It is based on [@bytecodealliance/jco](https://github.com/bytecodealliance/jco), which allows transpiling WASI Components to JavaScript modules.

## Installation

```bash
npm install --save-dev rollup-plugin-jco
```

## Usage

The plugin can be used in your Rollup configuration file to transpile a WASI component to a JavaScript module. The plugin will output JavaScript(s) file that can be imported into your code. In the example below, the plugin will output a file named `your_unique_component_name.js` in the `./bindings` directory.

```js
// rollup.config.js
import { transpileComponent } from 'rollup-plugin-jco';

export default {
  // ... your rollup config ...
  plugins: [
    transpileComponent({
      name: 'your_unique_component_name',
      inputFile: './path/to/your/wasi/component.wasm',
      outDir: './bindings', // Or anywhere you want to output the transpiled JS
      transpileOpts: {
        minify: true, // Enable if you want to minify the output
        tlaCompat: true, // Enable if you want to support older browsers
        base64Cutoff: 9e9, // Recommended to bundle your WASM file in the JS
        // Additional options can be found in the @bytecodealliance/jco documentation
      },
    })
  ]
};
```

For a full example of how the plugin can be used in a React + Vite project, see the included example in the `example` directory:

- [React + Vite Adder WASI Component Example](https://github.com/rioam2/rollup-plugin-jco/tree/main/examples/adder)

## API Reference

Full API reference for the plugin is generated using typedoc and can be found [here](https://github.com/rioam2/rollup-plugin-jco/tree/main/packages/plugin/docs).

Information relating to the JCO API can be found [here](https://bytecodealliance.github.io/jco/) or on the [JCO GitHub repository](https://github.com/bytecodealliance/jco).