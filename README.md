# rollup-plugin-jco

> ✨ Leverage WASI Components by simply importing them into your project! ✨
> - 🤖 Automatically transpile WebAssembly component bindings to JavaScript
> - 🌳 Automatically generate TypeScript types from WIT definitions
> - ⚡️ Lazy instantiation support
> - 💻 Rollup and Vite support

---

A plugin for [Rollup](https://rollupjs.org) and [Vite](https://vite.dev/) that allows you to easily import WebAssembly (WASI) components into your JavaScript or Typescript codebase. It is based on [@bytecodealliance/jco](https://github.com/bytecodealliance/jco), which allows transpiling WASI Components to JavaScript modules.

## Installation

To install the plugin, you can use npm or yarn. Make sure you have  `@bytecodealliance/jco` installed in your project; this plugin requires it as a peer-dependency.

```bash
npm install --save-dev rollup-plugin-jco @bytecodealliance/jco
```

## Usage

The plugin can be used in your Rollup or Vite configuration file to transpile a WASI component to a JavaScript module. It will automatically handle the transpilation process and generate the necessary bindings for you.

Here's how to initialize the plugin with Rollup and/or Vite:

<table>
  <tr>
    <td>Vite</td>
    <td>Rollup</td>
  </tr>
  <tr>
  <td> 

```js
// vite.config.js
import { defineConfig } from 'vite';
import { wasi } from 'rollup-plugin-jco';

export default defineConfig({
  // ... your vite config ...
  plugins: [
    wasi({/* Extra jco options*/})
  ]
});
```

  </td>
  <td>

```js
// rollup.config.js
import { wasi } from 'rollup-plugin-jco';

export default {
  // ... your rollup config ...
  plugins: [
      wasi({/* Extra jco options*/})
  ]
};
```

  </td>
  </tr>
</table>

Then, you can import a WebAssembly Component directly in your JS/TS code. Any additional JCO transpilation options can be passed directly in the import statement as query parameters.

> [!NOTE]
> Type generation occurs upon build. When importing a component for the first time, you can expect your IDE to show an error until you build your project next.

```js
import component from './adder_component.wasm?component';

// Typescript types will automatically be generated after first build
const result = component.addTwoIntegers(1, 2);
```

### Full Example

For a full example of how the plugin can be used in a React + Vite project, see the included example in the `example` directory:

- React + Vite Adder WASI Component Example: [`./examples/adder`](https://github.com/rioam2/rollup-plugin-jco/tree/main/examples/adder)
  - Importing a WASI component: [`./examples/adder/src/components/AdderFromImport.tsx`](https://github.com/rioam2/rollup-plugin-jco/tree/main/examples/adder/src/components/AdderFromImport.tsx)
  - Importing a WASI component with lazy instantiation: [`./examples/adder/src/components/AdderFromImportAsync.tsx`](https://github.com/rioam2/rollup-plugin-jco/tree/main/examples/adder/src/components/AdderFromImportAsync.tsx)

## API Reference

Full API reference for the plugin is generated using typedoc and can be found [here](https://github.com/rioam2/rollup-plugin-jco/tree/main/packages/plugin/docs).

Information relating to the JCO API can be found [here](https://bytecodealliance.github.io/jco/) or on the [JCO GitHub repository](https://github.com/bytecodealliance/jco).