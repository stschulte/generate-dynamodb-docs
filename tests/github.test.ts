import { describe, expect, it } from 'vitest';

import { sortEntries } from '../src/metadata.js';

describe('sortEntries', () => {
  it('sorts by first item', () => {
    const entries: [string, unknown][] = [
      ['bar', 20],
      ['foo', { message: 'Hi' }],
      ['alice', 'unimportant'],
      ['charly', null],
    ];
    expect(entries.sort(sortEntries)).toStrictEqual([
      ['alice', 'unimportant'],
      ['bar', 20],
      ['charly', null],
      ['foo', { message: 'Hi' }],
    ]);
  });
});
