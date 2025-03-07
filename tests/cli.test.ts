import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { Writable } from 'node:stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cli, raiseIfNotSet } from '../src/cli.js';
import { stdoutStream } from '../src/stdoutStream.js';

function readTestData(filename: string): string {
  return readFileSync(testData(filename), 'utf8');
}

function testData(filename: string): string {
  return join(__dirname, 'data', filename);
}

vi.mock('../src/stdoutStream.js', () => ({
  stdoutStream: vi.fn(),
}));

describe('cli', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join('.', 'test-cli'));

    return () => {
      rmSync(tmpDir, { force: true, recursive: true });
    };
  });

  describe('mode overwrite', () => {
    it('creates markdown file when file not exist yet', async () => {
      copyFileSync(testData('example.yml'), join(tmpDir, 'dynamodb.yml'));

      expect(existsSync(join(tmpDir, 'README.md'))).toBeFalsy();
      const rc = await cli([
        'node',
        'generate-dynamodb-docs',
        '--output-file',
        join(tmpDir, 'README.md'),
        '--mode',
        'overwrite',
        join(tmpDir, 'dynamodb.yml'),
      ]);
      expect(rc).toBe(0);
      expect(existsSync(join(tmpDir, 'README.md'))).toBeTruthy();

      expect(readFileSync(join(tmpDir, 'README.md'), 'utf8')).toStrictEqual(readTestData('example.md'));
    });

    it('creates typescript file when file not exist yet', async () => {
      copyFileSync(testData('example.yml'), join(tmpDir, 'dynamodb.yml'));

      expect(existsSync(join(tmpDir, 'dynamodb.ts'))).toBeFalsy();
      const rc = await cli([
        'node',
        'generate-dynamodb-docs',
        '--output-file',
        join(tmpDir, 'dynamodb.ts'),
        '--output-type',
        'typescript',
        '--mode',
        'overwrite',
        join(tmpDir, 'dynamodb.yml'),
      ]);
      expect(rc).toBe(0);
      expect(existsSync(join(tmpDir, 'dynamodb.ts'))).toBeTruthy();

      expect(readFileSync(join(tmpDir, 'dynamodb.ts'), 'utf8')).toStrictEqual(readTestData('example.ts.txt'));
    });
  });

  describe('mode inject', () => {
    it('injects markdown when file exists', async () => {
      copyFileSync(testData('example.yml'), join(tmpDir, 'dynamodb.yml'));
      copyFileSync(testData('existing-readme.md'), join(tmpDir, 'README.md'));

      const rc = await cli([
        'node',
        'generate-dynamodb-docs',
        '--output-file',
        join(tmpDir, 'README.md'),
        '--mode',
        'inject',
        join(tmpDir, 'dynamodb.yml'),
      ]);
      expect(rc).toBe(0);

      expect(readFileSync(join(tmpDir, 'README.md'), 'utf8')).toStrictEqual(readTestData('existing-readme-inject.md'));
    });

    it('injects typescript when file exists', async () => {
      copyFileSync(testData('example.yml'), join(tmpDir, 'dynamodb.yml'));
      copyFileSync(testData('existing-dynamodb.ts.txt'), join(tmpDir, 'dynamodb.ts'));

      const rc = await cli([
        'node',
        'generate-dynamodb-docs',
        '--output-file',
        join(tmpDir, 'dynamodb.ts'),
        '--output-type',
        'typescript',
        '--mode',
        'inject',
        join(tmpDir, 'dynamodb.yml'),
      ]);
      expect(rc).toBe(0);

      expect(readFileSync(join(tmpDir, 'dynamodb.ts'), 'utf8')).toStrictEqual(readTestData('existing-dynamodb-inject.ts.txt'));
    });
  });

  describe('no output file', () => {
    it('prints markdown to stdout', async () => {
      let mockedStdout = '';
      vi.mocked(stdoutStream).mockReturnValue(
        new Writable({
          write(chunk: string, _encoding, callback) {
            mockedStdout += chunk;
            callback();
          },
        }),
      );

      copyFileSync(testData('example.yml'), join(tmpDir, 'dynamodb.yml'));

      const rc = await cli([
        'node',
        'generate-dynamodb-docs',
        join(tmpDir, 'dynamodb.yml'),
      ]);
      expect(rc).toBe(0);

      expect(mockedStdout).toStrictEqual(readTestData('example.md'));
    });

    it('prints typescript to stdout', async () => {
      let mockedStdout = '';
      vi.mocked(stdoutStream).mockReturnValue(
        new Writable({
          write(chunk: string, _encoding, callback) {
            mockedStdout += chunk;
            callback();
          },
        }),
      );

      copyFileSync(testData('example.yml'), join(tmpDir, 'dynamodb.yml'));

      const rc = await cli([
        'node',
        'generate-dynamodb-docs',
        '--output-type',
        'typescript',
        join(tmpDir, 'dynamodb.yml'),
      ]);
      expect(rc).toBe(0);

      expect(mockedStdout).toStrictEqual(readTestData('example.ts.txt'));
    });
  });
});

describe('raiseIfNotSet', () => {
  it('raises an error when not set', () => {
    const file = undefined;
    expect(() => {
      raiseIfNotSet(file, 'File not set');
    }).toThrow('File not set');
  });

  it('passes when set', () => {
    const file = 'actions.yml';
    expect(() => {
      raiseIfNotSet(file, 'File not set');
    }).not.toThrow();
  });
});
