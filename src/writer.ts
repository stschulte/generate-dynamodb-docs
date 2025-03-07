import { createWriteStream, mkdtempSync, renameSync, rmSync, statSync, WriteStream } from 'node:fs';
import { basename, join } from 'node:path';

/**
 * Closes a WriteStream in a way you can await the closing
 *
 * When you call `close()` on a `WriteStream`, the close will
 * complete asynchronously. You can pass a callback that should be called
 * once the file  is actually closed.
 *
 * This function wraps this into a Promise you can easily await.
 *
 * @param stream - The stream you want to close
 * @returns A promise that resolves once the stream is actually closed
 */
export async function closeStream(stream: WriteStream): Promise<boolean> {
  return new Promise((resolve, reject) => {
    stream.close((err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(true);
      }
    });
  });
}

/**
 * Replace a file atomically through renaming
 *
 * This function can be used to write to a file by first writing the content
 * to a temporary file and then renaming the file atomically.
 *
 * This also allows you to read the original file while preparing the new one.
 *
 * The file will be renamed when the callback completes
 *
 * @param filename - The file you want to create or overwrite
 * @param callback - A callback that receives a WriteStream for a temporary
 * file. Once the callback completes (or resolved for async callbacks) the
 * temporary file is moved in place for the original filename.
 *
 * This means you can access the original file inside your callback and you will
 * see the original content.
 * @returns - The return value of your callback
 */
export async function replaceFile<R>(path: string, callback: (stream: WriteStream) => Promise<R> | R): Promise<R> {
  let tmpDir: string | undefined;

  try {
    const statResult = statSync(path, { throwIfNoEntry: false });
    const filename = basename(path);
    tmpDir = mkdtempSync(join('.', 'generate-dynamodb-docs'));
    const newFilePath = join(tmpDir, filename);

    /* We want to copy the file mode (least significant 12 bits), not the file type information */
    const stream = createWriteStream(newFilePath, {
      encoding: 'utf8',
      ...(statResult ? { mode: statResult.mode & 0o7777 } : {}),
    });
    const result = await Promise.resolve(callback(stream));

    /* Ensure we await closing the file */
    await closeStream(stream);

    renameSync(newFilePath, path);
    return result;
  }
  finally {
    if (tmpDir) {
      rmSync(tmpDir, { force: true, recursive: true });
    }
  }
}
