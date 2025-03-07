import { Writable } from 'node:stream';

export function stdoutStream() {
  return new Writable({
    write(chunk: string, encoding, callback) {
      process.stdout.write(chunk, encoding, callback);
    },
  });
}
