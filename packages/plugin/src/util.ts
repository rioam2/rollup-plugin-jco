import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { ControlledTranspileOptions } from './types/jco';

/**
 * Reads a file from disk and returns its contents as a Uint8Array.
 * @param file Path of file to read
 * @returns The file's contents as a Uint8Array
 */
export async function readFile(file: string): Promise<Uint8Array> {
  const buffer = await fs.promises.readFile(file);
  const bytes = new Uint8Array(buffer.buffer);
  return bytes;
}

/**
 * Computes the SHA-256 hash of a byte array.
 * @param bytes Byte array to hash
 * @returns SHA-256 hash as a hex string
 */
export function computeSha256(bytes: Uint8Array): string {
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  return hash;
}

/**
 * Returns the path of the cache file for a WebAssembly component's generated bindings.
 * @param outputDir Output directory of generated bindings
 * @param name Name of WebAssembly component
 * @returns Path of cache file
 */
export function getCacheFile(outputDir: string, name: string) {
  return path.join(outputDir, `${name}.cache`);
}

/**
 * Reads the cache file for a WebAssembly component's generated bindings from disk.
 * @param outputDir Output directory of generated bindings
 * @param name Name of WebAssembly component
 * @returns Contents of cache file as a string
 */
export async function readCacheFile(outputDir: string, name: string) {
  const cacheFile = getCacheFile(outputDir, name);
  return fs.promises.readFile(cacheFile, 'utf-8').catch(() => '');
}

/**
 * Writes a hash to the cache file for a WebAssembly component's generated bindings.
 * @param outputDir Output directory of generated bindings
 * @param name Name of WebAssembly component
 * @param hash Hash to write to cache file
 */
export async function writeCacheFile(
  outputDir: string,
  name: string,
  hash: string,
) {
  const cacheFile = getCacheFile(outputDir, name);
  await fs.promises.mkdir(outputDir, { recursive: true });
  await fs.promises.writeFile(cacheFile, hash);
}

/**
 * Transforms a search parameter value into a primitive Javascript literal
 * @param value Search parameter value
 * @returns parsed Javascript literal
 */
export function searchParamToPrimitive(value: string) {
  if (value === '') return true;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(+value)) return +value;
  return value;
}

/**
 * Parses JCO transpile options from an import URL
 * @param url Url of a component import
 * @returns Parsed transpile options from import URL
 */
export function extractTranspileOptionsFromUrl(url: URL) {
  const searchParams = [...url.searchParams.entries()];
  return searchParams.reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: searchParamToPrimitive(value),
    }),
    {} as ControlledTranspileOptions,
  );
}
