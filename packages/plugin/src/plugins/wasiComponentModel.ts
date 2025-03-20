import { transpile } from '@bytecodealliance/jco';
import path from 'path';
import type { Plugin } from 'rollup';
import { ControlledTranspileOptions, TranspileOptions } from 'src/types/jco';
import { PLUGIN_NAME, PLUGIN_VERSION } from '../constants';
import {
  createCustomPackage,
  decodeAsString,
  extractTranspileOptionsFromUrl,
  readCustomPackage,
  readFile,
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
      const { files } = await transpile(inputBytes, transpileOptions);
      const transpiledJs = decodeAsString(files[`${fileBasename}.js`]);
      const transpiledDecl = decodeAsString(files[`${fileBasename}.d.ts`]);

      // Construct an ambient module declaration for the component's Typescript bindings
      const outputDeclarationPrefix = `declare module "*${relativeFilePath}${importUrl.search}"`;
      const outputDeclaration = `${outputDeclarationPrefix} { ${transpiledDecl
        .replaceAll(/^\S*\/\/.*$/gm, '')
        .replaceAll('\n', ' ')} }`;

      // Generate a custom npm package to store the component's Typescript bindings
      // This package starts with the '@types' prefix to ensure it is automatically picked up by Typescript
      const typesPackage = '@types/rollup-plugin-jco-generated';
      const declarationFileName = 'components.gen.d.ts';
      const existingTypesPackage = await readCustomPackage(typesPackage);

      // Load any existing declarations for the package and merge with the newly generated declaration
      const mergedDeclarations = new TextEncoder().encode(
        [
          ...new TextDecoder()
            .decode(existingTypesPackage?.files[declarationFileName])
            .split('\n')
            .filter((line) => !!line)
            .filter((line) => !line.startsWith(outputDeclarationPrefix)),
          outputDeclaration,
        ].join('\n'),
      );

      // Create or update the existing custom package with the new merged declarations
      await createCustomPackage({
        package: {
          name: typesPackage,
          private: true,
          types: declarationFileName,
        },
        files: { [declarationFileName]: mergedDeclarations },
      });

      console.log();
      return transpiledJs;
    },
  };
}
