import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import type { Metadata } from '../src/metadata.js';

import {
  generateMarkdown,
  generateTypescript,
  mdAnchor,
  mdBoolean,
  mdCode,
  mdString,
} from '../src/generator.js';

function readTestData(filename: string): string {
  return readFileSync(join(__dirname, 'data', filename), 'utf8');
}

describe('mdString', () => {
  it('keeps a single string', () => {
    expect(mdString('Hello World')).toStrictEqual('Hello World');
  });

  it('transforms a single newline into whitespace', () => {
    const input = `I think this should keep going
on a new line`;
    expect(mdString(input)).toStrictEqual('I think this should keep going on a new line');
  });

  it('replaces a paragraph with html linebreaks', () => {
    const input = `For more info
see here.

Or here.`;
    expect(mdString(input)).toStrictEqual('For more info see here.<br><br>Or here.');
  });
});

describe('mdBoolean', () => {
  it('returns yes for true values', () => {
    expect(mdBoolean(true)).toStrictEqual('yes');
  });

  it('returns no for false values', () => {
    expect(mdBoolean(false)).toStrictEqual('no');
  });

  it('returns no for undefined values', () => {
    expect(mdBoolean(undefined)).toStrictEqual('no');
  });
});

describe('mdCode', () => {
  it('puts a string into an inline code block', () => {
    expect(mdCode('echo foo')).toStrictEqual('`echo foo`');
  });

  it('returns an empty string for undefined values', () => {
    expect(mdCode(undefined)).toStrictEqual('');
  });
});

describe('mdAnchor', () => {
  it('creates an anchor', () => {
    expect(mdAnchor('input', 'foo_bar')).toStrictEqual('<a name="input_foo_bar"></a> [foo\\_bar](#input\\_foo\\_bar)');
  });

  it('replaces - with _', () => {
    expect(mdAnchor('input', 'foo-bar')).toStrictEqual('<a name="input_foo_bar"></a> [foo-bar](#input\\_foo\\_bar)');
  });
});

describe('generateMarkdown', () => {
  it('generates a valid documentation', () => {
    const testdata = parse(readTestData('example.yml')) as Metadata;
    const expectedResult = readTestData('example.md');
    expect(Array.from(generateMarkdown(testdata)).join('')).toStrictEqual(expectedResult);
  });

  it('uses the default optional value', () => {
    const testdata = parse(readTestData('example-default-optional.yml')) as Metadata;
    const expectedResult = readTestData('example-default-optional.md');
    expect(Array.from(generateMarkdown(testdata)).join('')).toStrictEqual(expectedResult);
  });

  it('uses the default type value', () => {
    const testdata = parse(readTestData('example-default-type.yml')) as Metadata;
    const expectedResult = readTestData('example-default-type.md');
    expect(Array.from(generateMarkdown(testdata)).join('')).toStrictEqual(expectedResult);
  });
});

describe('generateTypescript', () => {
  it('generates a valid documentation', () => {
    const testdata = parse(readTestData('example.yml')) as Metadata;
    const expectedResult = readTestData('example.ts.txt');
    expect(Array.from(generateTypescript(testdata)).join('')).toStrictEqual(expectedResult);
  });

  it('uses the default optional value', () => {
    const testdata = parse(readTestData('example-default-optional.yml')) as Metadata;
    const expectedResult = readTestData('example-default-optional.ts.txt');
    expect(Array.from(generateTypescript(testdata)).join('')).toStrictEqual(expectedResult);
  });

  it('uses the default type value', () => {
    const testdata = parse(readTestData('example-default-type.yml')) as Metadata;
    const expectedResult = readTestData('example-default-type.ts.txt');
    expect(Array.from(generateTypescript(testdata)).join('')).toStrictEqual(expectedResult);
  });
});
