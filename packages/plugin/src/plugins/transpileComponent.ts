import { transpile } from '@bytecodealliance/jco';
import * as fs from 'fs';
import * as path from 'path';
import type { Plugin } from 'rollup';
import { PLUGIN_NAME, PLUGIN_VERSION } from '../constants';
import {
  computeSha256,
  readCacheFile,
  readFile,
  writeCacheFile,
} from '../util';
import { ControlledTranspileOptions } from 'src/types/jco';

// Log prefix for plugin
const logPrefix = `[${PLUGIN_NAME}@${PLUGIN_VERSION}][transpileComponent]`;

// Log messages for the plugin
const logMessages = {
  cacheHit: (name: string) =>
    `${logPrefix} Using cached bindings for ${name}\n`,
  cacheMiss: (name: string) =>
    `${logPrefix} Generating WASI bindings for ${name}`,
  fileWrite: (filePath: string, size: number) =>
    ` + ${filePath}\t\t${size / 1000} kB`,
};

/**
 * Options for the `transpileComponent` rollup plugin.
 * `transpileOpts` are options passed to the `transpile` function from `@bytecodealliance/jco`.
 * @interface
 * @expand
 */
export interface TranspileComponentOptions {
  /** Unique name of the WebAssembly Component (used to name generated bindings) */
  name: string;
  /** Output directory for generated bindings */
  outDir: string;
  /** Path to the input WebAssembly component to transpile */
  inputFile: string;
  /**
   * Options passed to the `transpile` function of `@bytecodealliance/jco`
   * @see https://bytecodealliance.github.io/jco/transpiling.html
   * @interface
   * @expand
   */
  transpileOpts?: ControlledTranspileOptions;
}

/**
 * Rollup plugin that transpiles a WebAssembly component to a set of JavaScript bindings.
 * @param options Plugin options
 * @returns Rollup plugin
 */
export function transpileComponent(options: TranspileComponentOptions): Plugin {
  return {
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,
    async buildStart() {
      console.log();

      // Read the input WebAssembly component from disk
      const inputBytes = await readFile(options.inputFile);

      // Check if the cache is up-to-date and skip generation if possible
      const inputHash = computeSha256(inputBytes);
      const optionsString = JSON.stringify(options.transpileOpts);
      const optionsHash = computeSha256(Buffer.from(optionsString));
      const compositeHash = inputHash + optionsHash;
      const existingHash = await readCacheFile(options.outDir, options.name);
      if (compositeHash === existingHash) {
        return console.log(logMessages.cacheHit(options.name));
      }

      // Generate bindings for WebAssembly component and write to disk
      console.log(logMessages.cacheMiss(options.name));
      const result = await transpile(inputBytes, {
        ...options.transpileOpts,
        name: options.name,
        outDir: options.outDir,
      });
      for (const [filePath, fileContent] of Object.entries(result.files)) {
        const dirname = path.dirname(filePath);
        await fs.promises.mkdir(dirname, { recursive: true });
        await fs.promises.writeFile(filePath, fileContent);
        console.log(logMessages.fileWrite(filePath, fileContent.length));
      }

      // Update cache file with new hash
      await writeCacheFile(options.outDir, options.name, compositeHash);
      console.log();
    },
  };
}
