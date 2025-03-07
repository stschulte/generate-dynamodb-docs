import { describe, expect, it, vi } from 'vitest';

import { stdoutStream } from '../src/stdoutStream.js';

describe('stdoutStream', () => {
  it('provides a stream we can write to', async () => {
    let data = '';

    /* We mock stdout to just fill data */
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk, _encoding, callback) => {
      data += chunk.toString();

      if (callback) {
        callback();
      }
      return true;
    });

    await new Promise((resolve, reject) => {
      const stream = stdoutStream();
      stream.write('Hello, ', 'utf8');
      stream.write('World', 'utf8', (err) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(true);
        }
      });
    });

    expect(data).toStrictEqual('Hello, World');
  });
});
