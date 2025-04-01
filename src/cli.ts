import { Command, Option } from 'commander';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { Readable } from 'node:stream';
import { parse } from 'yaml';

import type { Metadata, MetadataExec } from './metadata.js';

import { generateMarkdown, generateTypescript } from './generator.js';
import { merge } from './merger.js';
import { stdoutStream } from './stdoutStream.js';
import { replaceFile } from './writer.js';

type Options = {
  mode?: 'inject' | 'overwrite';
  outputFile?: string;
  outputType?: 'markdown' | 'typescript';
  sections?: Array<'inputs' | 'outputs' | 'type'>;
};

export async function cli(args: string[]): Promise<number> {
  const command = new Command();
  command
    .name('generate-dynamodb-docs')
    .version('0.2.0')
    .option('--output-file [output-file]', 'file to modify. If not specified prints on stdout')
    .addOption(new Option('--output-type [output-type]', 'Output type').choices(['markdown', 'typescript']))
    .addOption(new Option('--sections [sections...]', 'specify one or more sections to render. Available sections are "type", "inputs", "outputs"').choices(['outputs', 'inputs', 'type']))
    .addOption(new Option('--mode <mode>', 'overwrite a file or inject').choices(['overwrite', 'inject']))
    .argument('<file>', 'location of your dynamodb.yml file');

  command.parse(args);

  const file = command.args[0];
  const options = command.opts<Options>();
  const outputFile = options.outputFile;
  const outputType = options.outputType ?? 'markdown';

  raiseIfNotSet(file, 'You have to provide the path to your \'dynamodb.yml\' file');

  const yaml = parse(readFileSync(file, 'utf8')) as Metadata;
  const doc = outputType === 'markdown' ? generateMarkdown(yaml) : generateTypescript(yaml);
  const postExec = outputType === 'typescript'
    ? yaml.config?.typescript?.['post-exec']
    : yaml.config?.markdown?.['post-exec'];

  if (outputFile) {
    await replaceFile(outputFile, async (writeStream) => {
      return new Promise((resolve, reject) => {
        const readStream = options.mode === 'inject' ? Readable.from(merge(outputFile, doc, outputType)) : Readable.from(doc);

        readStream
          .pipe(writeStream)
          .on('close', () => { resolve(0); })
          .on('error', (error) => { reject(error); });
      });
    });
  }
  else {
    await new Promise((resolve, reject) => {
      const readStream = Readable.from(doc);
      const writeStream = stdoutStream();

      readStream
        .pipe(writeStream)
        .on('close', () => { resolve(0); })
        .on('error', (error) => { reject(error); });
    });
  }

  if (postExec && outputFile) {
    const rc = await runPostExec(postExec, outputFile);
    return rc;
  }

  return 0;
}

export function raiseIfNotSet<T>(input: T | undefined, message: string): asserts input is T {
  if (input === undefined) {
    throw new Error(message);
  }
  return undefined;
}

export async function runPostExec(config: MetadataExec[], filename: string): Promise<number> {
  for (const execItem of config) {
    const { args = [], cmd, name } = execItem;
    const realArgs = [...args, filename];
    console.log(`Executing post-exec ${name} (cmd=${cmd}, args=${realArgs.toString()}`);
    const code = await new Promise<number>((resolve, reject) => {
      const child = spawn(cmd, args);
      child
        .on('exit', (code) => {
          if (code === null) {
            reject(new Error('Process closed but no code available'));
          }
          else {
            resolve(code);
          }
        })
        .on('error', (err) => {
          reject(err);
        });
    });
    if (code === 0) {
      console.log(`Executing post-exec ${name} completed`);
    }
    else {
      console.log(`Executing post-exec ${name} failed (rc=${code.toString()})`);
      return code;
    }
  }
  return 0;
}
