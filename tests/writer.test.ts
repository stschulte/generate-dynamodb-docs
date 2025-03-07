import { createWriteStream, mkdtempSync, readFileSync, rmSync, writeFileSync, WriteStream } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

import { closeStream, replaceFile } from '../src/writer.js';

describe('closeStream', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = mkdtempSync(join('.', 'test-writer'));

    return () => {
      rmSync(tmpDir, { force: true, recursive: true });
    };
  });

  it('closes a stream', async () => {
    const file = join(tmpDir, 'test.txt');
    const stream = createWriteStream(file, 'utf8');

    stream.write('Hello World\n');
    expect(stream.closed).toBeFalsy();
    await closeStream(stream);
    expect(stream.closed).toBeTruthy();
  });

  it('ensures data is written', async () => {
    const file = join(tmpDir, 'test.txt');
    const stream = createWriteStream(file, 'utf8');

    stream.write('Hello World\n');
    await closeStream(stream);

    const content = readFileSync(file, 'utf8');
    expect(content).toStrictEqual('Hello World\n');
  });

  it('raises errors when closing fails', async () => {
    const stream = {
      close(callback?: (err?: NodeJS.ErrnoException | null) => void): void {
        if (callback) {
          callback({
            code: 'foo',
            message: 'Failed to close the stream',
            name: 'Foo error',
          });
        }
      },
    } as unknown as WriteStream;

    const promise = closeStream(stream);
    await expect(promise).rejects.toThrow(/Failed to close the stream/);
  });
});

describe('replaceFile', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = mkdtempSync(join('.', 'test-writer'));

    return () => {
      rmSync(tmpDir, { force: true, recursive: true });
    };
  });

  it('creates a new file', async () => {
    const file = join(tmpDir, 'new.txt');

    const result = await replaceFile(file, (stream) => {
      stream.write('Hello World\n');
      return 42;
    });

    const content = readFileSync(file, 'utf8');
    expect(result).toBe(42);
    expect(content).toStrictEqual('Hello World\n');
  });

  it('replaces an existing file', async () => {
    const file = join(tmpDir, 'existing.txt');
    writeFileSync(file, 'Hello World\n', 'utf8');

    const result = await replaceFile(file, (stream) => {
      stream.write('Hello Universe\n');
      return 42;
    });

    const content = readFileSync(file, 'utf8');
    expect(result).toBe(42);
    expect(content).toStrictEqual('Hello Universe\n');
  });
});
