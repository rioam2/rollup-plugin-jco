import { transpile } from '@bytecodealliance/jco';
import path from 'path';
import type { Plugin } from 'rollup';
import { ControlledTranspileOptions, TranspileOptions } from 'src/types/jco';
import { PLUGIN_NAME, PLUGIN_VERSION } from '../constants';
import {
  createModuleDeclaration,
  decodeAsString,
  extractTranspileOptionsFromUrl,
  readFile,
  updateCustomPackageDeclaration,
} from '../util';

// Log prefix for plugin
const logPrefix = `[${PLUGIN_NAME}@${PLUGIN_VERSION}]`;

// Log messages for the plugin
const logMessages = {
  transpileStart: (name: string) =>
    `${logPrefix} Generating WebAssembly/WASI bindings for ${name}`,
};

/**
 * Options for the `wasiComponentModel` rollup plugin.
 * @interface
 * @expand
 */
export type WasiComponentModelOptions = ControlledTranspileOptions;

/**
 * Rollup plugin that transpiles a WebAssembly component to a set of JavaScript bindings.
 * @param options Plugin options
 * @returns Rollup plugin
 */
export function wasiComponentModel(
  options?: WasiComponentModelOptions,
): Plugin {
  return {
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,
    async transform(_code, id) {
      const importPath = `file://${id[0] === '/' ? id : path.relative('./node_modules', id)}`;
      const importUrl = new URL(importPath);

      const shouldTransformComponent =
        importUrl.searchParams.has('component') &&
        importUrl.pathname.endsWith('.wasm');

      const shouldTransformWasmCores =
        importUrl.searchParams.has('cores') &&
        importUrl.pathname.endsWith('.wasm');

      if (shouldTransformComponent) {
        return transpileComponent(importUrl, options);
      }

      if (shouldTransformWasmCores) {
        return transpileWasmCores(importUrl, options);
      }

      return null;
    },
  };
}

async function transpileComponent(
  importUrl: URL,
  options?: WasiComponentModelOptions,
) {
  console.log();

  // Extract WASI component information from import URL
  const filePath = importUrl.pathname;
  const fileBasename = path.basename(filePath);
  const relativeFilePath = path.relative('./', filePath);

  console.log(logMessages.transpileStart(fileBasename));

  // Prepare input and options for component transpilation
  const inputBytes = await readFile(filePath);
  const transpileOptions: TranspileOptions = {
    name: fileBasename,
    ...options,
    ...extractTranspileOptionsFromUrl(importUrl),
  };

  // Transpile WASI component to Javascript using JCO
  const { files } = await transpile(inputBytes, transpileOptions);
  const transpiledJs = decodeAsString(files[`${fileBasename}.js`]);
  const transpiledDecl = decodeAsString(files[`${fileBasename}.d.ts`]);

  // Construct an ambient module declaration for the component's Typescript bindings
  const moduleName = `${relativeFilePath}${importUrl.search}`;
  const outputDeclaration = createModuleDeclaration(moduleName, transpiledDecl);

  // Temporary fix for incorrect module declaration for async instantiation in JCO
  // The instantiation function should return a Promise, but the declaration is missing the Promise type
  const fixedOutputDeclaration =
    transpileOptions.instantiation === 'async'
      ? outputDeclaration.replaceAll('): Root', '): Promise<Root>')
      : outputDeclaration;

  // Generate a custom npm package to store the component's Typescript bindings
  // This package starts with the '@types' prefix to ensure it is automatically picked up by Typescript
  const declarationFileName = 'components.gen.d.ts';
  const typesPackage = '@types/rollup-plugin-jco-generated';

  updateCustomPackageDeclaration(
    typesPackage,
    declarationFileName,
    fixedOutputDeclaration,
  );

  console.log();

  return transpiledJs;
}

async function transpileWasmCores(
  importUrl: URL,
  options?: WasiComponentModelOptions,
) {
  console.log();

  // Extract WASI component information from import URL
  const filePath = importUrl.pathname;
  const fileBasename = path.basename(filePath);

  // Prepare input and options for component transpilation
  const inputBytes = await readFile(filePath);
  const transpileOptions: TranspileOptions = {
    name: fileBasename,
    ...options,
    ...extractTranspileOptionsFromUrl(importUrl),
    // Required to transpile wasm cores
    instantiation: 'async',
  };

  // Extract core WebAssembly modules from the WASI component
  const { files } = await transpile(inputBytes, transpileOptions);
  const cores = Object.fromEntries(
    Object.entries(files)
      .filter(([key]) => key.endsWith('.wasm'))
      .map(([key, value]) => [key, [...value]]),
  );

  const moduleName = `${fileBasename}${importUrl.search}`;
  const moduleDeclaration = `export function getCoreModule(name: string): WebAssembly.Module;`;
  const outputDeclaration = createModuleDeclaration(
    moduleName,
    moduleDeclaration,
  );

  // Generate a custom npm package to store the component's Typescript bindings
  // This package starts with the '@types' prefix to ensure it is automatically picked up by Typescript
  const declarationFileName = 'components.gen.d.ts';
  const typesPackage = '@types/rollup-plugin-jco-generated';

  updateCustomPackageDeclaration(
    typesPackage,
    declarationFileName,
    outputDeclaration,
  );

  // Return a Javascript module that exports the core WebAssembly modules
  return `
    /** Core WebAssembly module factory */
    export function getCoreModule(name) {
      const cores = ${JSON.stringify(cores)};
      return WebAssembly.compile(new Uint8Array(cores[name]));
    }
  `;
}
