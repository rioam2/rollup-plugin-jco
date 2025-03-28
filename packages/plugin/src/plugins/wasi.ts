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
  coreGenerationStart: (name: string, coreNum: string) =>
    `${logPrefix} Generating core WebAssembly module for ${name}, core number ${coreNum}`,
  invalidCoreNumber: (url: URL) =>
    `${logPrefix} Invalid core number in import URL: ${url}`,
  errorGeneratingCore: (name: string, numCores: number, coreNames: string[]) =>
    `${logPrefix} Error generating core WebAssembly module for ${name}. There are only ${numCores} core(s) in the source component: \n\n${coreNames.join('\n')}\n`,
};

/** Default options for the `wasi` rollup plugin. */
const DEFAULT_OPTIONS: ControlledTranspileOptions = {
  minify: true,
  tlaCompat: true,
  base64Cutoff: 9e9,
};

/**
 * Rollup plugin for transpiling WebAssembly components to JavaScript bindings using JCO.
 * This plugin also supports transpiling WebAssembly components to their core WebAssembly modules.
 * @see JCO-Documentation: https://bytecodealliance.github.io/jco/
 * @param options Transpilation options for JCO
 * @returns Rollup plugin for transpiling WebAssembly components
 * @throws Error if the component cannot be transpiled
 * @throws Error if the component is not a valid WebAssembly component
 */
export function wasi(options?: ControlledTranspileOptions): Plugin {
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
        importUrl.searchParams.has('core') &&
        importUrl.pathname.endsWith('.wasm');

      if (shouldTransformComponent) {
        return transpileComponent(importUrl, options);
      }

      if (shouldTransformWasmCores) {
        let coreNum = importUrl.searchParams.get('core');
        if (coreNum === '0') coreNum = ''; // For convenience, allow writing `core=0` instead of `core=`
        // Expect some core number to be present
        if (coreNum === null) {
          throw new Error(logMessages.invalidCoreNumber(importUrl));
        }
        return transpileWasmCores(importUrl, coreNum, options);
      }

      return null;
    },
  };
}

/**
 * Transpiles a WebAssembly component to it's corresponding JavaScript bindings using JCO.
 * @param importUrl URL of the component to transpile
 * @param options Transpilation options for JCO
 * @returns Transpiled JavaScript code
 * @throws Error if the component cannot be transpiled
 * @throws Error if the component is not a valid WebAssembly component
 */
async function transpileComponent(
  importUrl: URL,
  options?: ControlledTranspileOptions,
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
    ...DEFAULT_OPTIONS,
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

/**
 * Transpiles a WebAssembly component into its core WebAssembly modules using JCO.
 * @param importUrl URL of the component to transpile
 * @param coreNum Core number to transpile
 * @param options Transpilation options for JCO
 * @returns Transpiled WebAssembly module
 * @throws Error if the core number is invalid
 */
async function transpileWasmCores(
  importUrl: URL,
  coreNum: string,
  options?: ControlledTranspileOptions,
) {
  console.log();

  // Extract WASI component information from import URL
  const filePath = importUrl.pathname;
  const fileBasename = path.basename(filePath);

  console.log(logMessages.coreGenerationStart(fileBasename, coreNum || '0'));

  // Prepare input and options for component transpilation
  const inputBytes = await readFile(filePath);
  const transpileOptions: TranspileOptions = {
    name: fileBasename,
    ...DEFAULT_OPTIONS,
    ...options,
    ...extractTranspileOptionsFromUrl(importUrl),
    // Required to transpile wasm cores
    instantiation: 'async',
  };

  // Extract core WebAssembly modules from the WASI component
  const { files } = await transpile(inputBytes, transpileOptions);
  const coreBaseName = `${fileBasename}.core${coreNum}.wasm`;
  const core = files[coreBaseName];

  if (!core) {
    const cores = Object.keys(files).filter((file) =>
      file.startsWith(`${fileBasename}.core`),
    );
    throw new Error(
      logMessages.errorGeneratingCore(coreBaseName, cores.length, cores),
    );
  }

  const moduleName = `${fileBasename}${importUrl.search}`;
  const moduleDeclaration = `export const compile: () => Promise<WebAssembly.Module>;`;
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

  // Return an instantiated WebAssembly module for the requested core
  return `
    const core = ${JSON.stringify([...core])};
    export const compile = async () => WebAssembly.compile(new Uint8Array(core));
  `;
}
