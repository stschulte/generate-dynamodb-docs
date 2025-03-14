import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

type DocumentType = 'markdown' | 'typescript';
const PATTERN: Record<DocumentType, { end: RegExp; start: RegExp }> = {
  markdown: {
    end: /<!-- END_DYNAMODB_DOCS -->/,
    start: /<!-- BEGIN_DYNAMODB_DOCS -->/,
  },
  typescript: {
    end: /\/\* END_DYNAMODB_DOCS \*\//,
    start: /\/\* BEGIN_DYNAMODB_DOCS \*\//,
  },
};

export async function* merge(path: string, mergeIterator: Iterable<string>, documentType: 'markdown' | 'typescript'): AsyncGenerator<string, undefined, unknown> {
  const start_pattern = PATTERN[documentType].start;
  const end_pattern = PATTERN[documentType].end;

  const rl = createInterface({
    crlfDelay: Infinity,
    input: createReadStream(path),
  });

  let shouldCopy = true;
  for await (const line of rl) {
    if (start_pattern.exec(line)) {
      yield line;
      yield '\n';
      yield* mergeIterator;
      shouldCopy = false;
    }
    else if (end_pattern.exec(line)) {
      yield line;
      yield '\n';
      shouldCopy = true;
    }
    else if (shouldCopy) {
      yield line;
      yield '\n';
    }
  }
}
