import { transpile } from '@bytecodealliance/jco';
import fs from 'fs';
import path from 'path';
import type { Plugin } from 'rollup';
import { ControlledTranspileOptions, TranspileOptions } from 'src/types/jco';
import { PLUGIN_NAME, PLUGIN_VERSION } from '../constants';
import { extractTranspileOptionsFromUrl, readFile } from '../util';

// Log prefix for plugin
const logPrefix = `[${PLUGIN_NAME}@${PLUGIN_VERSION}]`;

// Log messages for the plugin
const logMessages = {
  transpileStart: (name: string) =>
    `${logPrefix} Generating WebAssembly/WASI bindings for ${name}\n`,
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

      // This plugin should not handle any WASM import that is not annotated with 'component' search parameter
      const shouldTransform =
        importUrl.searchParams.has('component') &&
        importUrl.pathname.endsWith('.wasm');
      if (!shouldTransform) return null;

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
      const result = await transpile(inputBytes, transpileOptions);

      // Extract transpiled Javascript bindings
      const transpiledJs: Uint8Array | string | undefined =
        result.files[`${fileBasename}.js`];

      // Extract transpiled Typescript declarations
      const transpiledDeclaration: Uint8Array | string | undefined =
        result.files[`${fileBasename}.d.ts`];

      if (!transpiledJs || !transpiledDeclaration) {
        throw new Error(`${logPrefix} Unable to transpile ${fileBasename}`);
      }

      const transpiledJsCode =
        typeof transpiledJs === 'string'
          ? transpiledJs
          : new TextDecoder().decode(transpiledJs);

      const transpiledDeclarationCode =
        typeof transpiledDeclaration === 'string'
          ? transpiledDeclaration
          : new TextDecoder().decode(transpiledDeclaration);

      // Construct an ambient module declaration for the component's Typescript bindings
      const outputDeclarationPrefix = `declare module "*${relativeFilePath}${importUrl.search}"`;
      const outputDeclaration = `${outputDeclarationPrefix} { ${transpiledDeclarationCode
        .replaceAll(/^\S*\/\/.*$/gm, '')
        .replaceAll('\n', ' ')} }`;

      const declarationOutputDirectory = path.resolve(
        './node_modules/@types/rollup-plugin-jco-generated',
      );

      const generatedDeclarationFile = path.join(
        declarationOutputDirectory,
        `components.gen.d.ts`,
      );

      await fs.promises.mkdir(declarationOutputDirectory, { recursive: true });
      const existingDeclarations = fs.existsSync(generatedDeclarationFile)
        ? await fs.promises.readFile(generatedDeclarationFile, 'utf-8')
        : '';

      const mergedDeclarations = [
        ...existingDeclarations
          .split('\n')
          .filter((line) => !!line)
          .filter((line) => !line.startsWith(outputDeclarationPrefix)),
        outputDeclaration,
      ].join('\n');

      await fs.promises.writeFile(generatedDeclarationFile, mergedDeclarations);

      const generatedPkgJson = {
        name: '@types/rollup-plugin-jco-generated',
        private: true,
        types: path.relative(
          declarationOutputDirectory,
          generatedDeclarationFile,
        ),
      };

      await fs.promises.writeFile(
        path.join(declarationOutputDirectory, `package.json`),
        JSON.stringify(generatedPkgJson, null, 2),
      );

      console.log();
      return transpiledJsCode;
    },
  };
}
