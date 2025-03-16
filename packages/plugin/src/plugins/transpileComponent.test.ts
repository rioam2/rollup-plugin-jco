import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import * as fs from 'fs';
import {
  transpileComponent,
  TranspileComponentOptions,
} from './transpileComponent';
import * as util from '../util';
import { transpile } from '@bytecodealliance/jco';

// Mock the transpile function from '@bytecodealliance/jco'
vi.mock('@bytecodealliance/jco', () => ({
  transpile: vi.fn(),
}));

describe('transpileComponent plugin', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  const dummyOptions: TranspileComponentOptions = {
    name: 'dummyComponent',
    outDir: '/fake/outDir',
    inputFile: '/fake/input.wasm',
    transpileOpts: { optimize: true },
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.restoreAllMocks();
    // Set up spies on util functions
    vi.spyOn(util, 'computeSha256').mockImplementation((input: any) => {
      return 'abc123';
    });
    vi.spyOn(util, 'readCacheFile').mockResolvedValue('');
    vi.spyOn(util, 'readFile').mockResolvedValue(Buffer.from('data'));
    vi.spyOn(util, 'writeCacheFile').mockResolvedValue(undefined);

    // Spy on fs.promises methods
    vi.spyOn(fs.promises, 'mkdir').mockResolvedValue(undefined);
    vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();

    // Set up transpile mock
    (transpile as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      files: {
        '/fake/outDir/dummyComponent.js': 'console.log("transpiled");',
      },
    });

    // Spy on console.log to capture log output
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should use cache when composite hash matches existing cache', async () => {
    // Mock readCacheFile to return composite hash that matches
    vi.spyOn(util, 'readCacheFile').mockResolvedValue('abc123abc123');

    const plugin = transpileComponent(dummyOptions);

    // Call buildStart hook
    if (plugin.buildStart && typeof plugin.buildStart === 'function') {
      await plugin.buildStart.bind(plugin)({});
    }
    // Expect a cache hit log message
    const logMessages = (consoleLogSpy.mock.calls as string[][]).map((log) =>
      log.join(' '),
    );
    expect(
      logMessages.some((msg) => msg.includes('Using cached bindings')),
    ).toBe(true);
    // Ensure transpile was not called
    expect(transpile).not.toHaveBeenCalled();
  });

  it('should transpile and write files when composite hash does not match cache', async () => {
    // Mock readCacheFile to return a different hash
    vi.spyOn(util, 'readCacheFile').mockResolvedValue('invalid-hash');

    const plugin = transpileComponent(dummyOptions);

    // Call buildStart hook
    if (plugin.buildStart && typeof plugin.buildStart === 'function') {
      await plugin.buildStart.bind(plugin)({});
    }
    // Expect a cache miss log message and file write log messages
    const logCalls = consoleLogSpy.mock.calls.map((call) => call.join(' '));
    expect(
      logCalls.some((msg) => msg.includes('Generating WASI bindings for')),
    ).toBe(true);
    expect(fs.promises.mkdir).toHaveBeenCalled();
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      '/fake/outDir/dummyComponent.js',
      'console.log("transpiled");',
    );
    // Ensure writeCacheFile was called to update the cache
    expect(util.writeCacheFile).toHaveBeenCalledWith(
      dummyOptions.outDir,
      dummyOptions.name,
      'abc123abc123',
    );
    // Ensure transpile was called with proper options
    expect(transpile).toHaveBeenCalledWith(Buffer.from('data'), {
      ...dummyOptions.transpileOpts,
      name: dummyOptions.name,
      outDir: dummyOptions.outDir,
    });
  });
});
