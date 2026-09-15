import type { ChangedFile, DiffLine, FileStatus } from '../src/types.js';

interface FileOptions {
  path: string;
  status?: FileStatus;
  added?: string[];
  removed?: string[];
}

function lines(texts: string[]): DiffLine[] {
  return texts.map((text, index) => ({ line: index + 1, text }));
}

export function file(options: FileOptions): ChangedFile {
  return {
    path: options.path,
    oldPath: null,
    status: options.status ?? 'modified',
    added: lines(options.added ?? []),
    removed: lines(options.removed ?? []),
  };
}
