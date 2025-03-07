import { describe, expect, it, vi } from 'vitest';

describe('bin', () => {
  it('runs the command', async () => {
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'dynamodb-docs', '--help']);
    const mockedWrite = vi.spyOn(process.stdout, 'write').mockImplementation(vi.fn());
    vi.spyOn(process, 'exit').mockImplementation((code) => {
      if (typeof code === 'number') {
        throw new Error(`Process exited with code ${code.toString()}`);
      }
      throw new Error('Process exited');
    });
    await expect(import('../src/bin.js')).rejects.toThrow(/Process exited with code 0/);
    expect(mockedWrite).toHaveBeenCalledWith(expect.stringMatching(/Usage: dynamodb-docs/) as string);
  });
});
