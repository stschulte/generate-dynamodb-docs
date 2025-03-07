import { describe, expect, it } from 'vitest';

import {
  generateMarkdown as generateMarkdownOrigin,
  generateTypescript as generateTypescriptOrigin,
} from '../src/generator.js';
import {
  generateMarkdown,
  generateTypescript,
} from '../src/index.js';

describe('index', () => {
  it('reexports generateMarkdown', () => {
    expect(generateMarkdown).toBe(generateMarkdownOrigin);
  });

  it('reexports generateTypescript', () => {
    expect(generateTypescript).toBe(generateTypescriptOrigin);
  });
});
