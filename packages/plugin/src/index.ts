import { transpile } from '@bytecodealliance/jco';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { Plugin } from 'rollup';

const name = 'rollup-plugin-jco';
const version = globalThis.globalVersion;
const logPrefix = `[${name}@${version}]`;

const logMessages = {
  cacheHit: (name: string) =>
    `${logPrefix} Using cached bindings for ${name}\n`,
  cacheMiss: (name: string) =>
    `${logPrefix} Generating WASI bindings for ${name}`,
  fileWrite: (filePath: string, size: number) =>
    ` + ${filePath}\t\t${size / 1000} kB`,
};

/**
 * Reads a file from disk and returns its contents as a Uint8Array and SHA-256 hash.
 * @param file Path of file to read
 * @returns A tuple containing the file's contents as a Uint8Array and its SHA-256 hash
 */
async function readWithHash(file: string): Promise<[Uint8Array, string]> {
  const buffer = await fs.promises.readFile(file);
  const bytes = new Uint8Array(buffer.buffer);
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  return [bytes, hash];
}

/**
 * Returns the path of the cache file for a WebAssembly component's generated bindings.
 * @param outputDir Output directory of generated bindings
 * @param name Name of WebAssembly component
 * @returns Path of cache file
 */
function getCacheFile(outputDir: string, name: string) {
  return path.join(outputDir, `${name}.cache`);
}

/**
 * Reads the cache file for a WebAssembly component's generated bindings from disk.
 * @param outputDir Output directory of generated bindings
 * @param name Name of WebAssembly component
 * @returns Contents of cache file as a string
 */
async function readCacheFile(outputDir: string, name: string) {
  const cacheFile = getCacheFile(outputDir, name);
  return fs.promises.readFile(cacheFile, 'utf-8').catch(() => '');
}

/**
 * Writes a hash to the cache file for a WebAssembly component's generated bindings.
 * @param outputDir Output directory of generated bindings
 * @param name Name of WebAssembly component
 * @param hash Hash to write to cache file
 */
async function writeCacheFile(outputDir: string, name: string, hash: string) {
  const cacheFile = getCacheFile(outputDir, name);
  await fs.promises.mkdir(outputDir, { recursive: true });
  await fs.promises.writeFile(cacheFile, hash);
}

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
  transpileOpts?: Omit<
    Parameters<typeof transpile>[1],
    keyof TranspileComponentOptions
  >;
}

/**
 * Rollup plugin that transpiles a WebAssembly component to a set of JavaScript bindings.
 * @param options Plugin options
 * @returns Rollup plugin
 */
export function transpileComponent(options: TranspileComponentOptions): Plugin {
  return {
    name,
    version,
    async buildStart() {
      console.log();

      // Read the input WebAssembly component and previous cache hash (if any)
      const [inputBytes, inputHash] = await readWithHash(options.inputFile);
      const existingHash = await readCacheFile(options.outDir, options.name);

      // Check if the cache is up-to-date and skip generation if possible
      if (inputHash === existingHash)
        return console.log(logMessages.cacheHit(options.name));

      // Generate bindings for WebAssembly component and write to disk
      console.log(logMessages.cacheMiss(name));
      const result = await transpile(inputBytes, options);
      for (const [filePath, fileContent] of Object.entries(result.files)) {
        const dirname = path.dirname(filePath);
        await fs.promises.mkdir(dirname, { recursive: true });
        await fs.promises.writeFile(filePath, fileContent);
        console.log(logMessages.fileWrite(filePath, fileContent.length));
      }

      // Update cache file with new hash
      await writeCacheFile(options.outDir, name, inputHash);
      console.log();
    },
  };
}
