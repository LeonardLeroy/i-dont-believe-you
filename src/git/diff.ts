import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { ChangedFile } from '../types.js';

const run = promisify(execFile);

const HUNK = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

export class GitError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'GitError';
  }
}

export function parseUnifiedDiff(diff: string): ChangedFile[] {
  const files: ChangedFile[] = [];
  let current: ChangedFile | null = null;
  let oldLine = 0;
  let newLine = 0;

  const push = (): void => {
    if (current) files.push(current);
  };

  for (const raw of diff.split(/\r?\n/)) {
    if (raw.startsWith('diff --git ')) {
      push();
      current = {
        path: pathFromHeader(raw),
        oldPath: null,
        status: 'modified',
        added: [],
        removed: [],
      };
      continue;
    }
    if (!current) continue;

    if (raw.startsWith('new file mode')) {
      current.status = 'added';
      continue;
    }
    if (raw.startsWith('deleted file mode')) {
      current.status = 'deleted';
      continue;
    }
    if (raw.startsWith('rename from ')) {
      current.status = 'renamed';
      current.oldPath = raw.slice('rename from '.length).trim();
      continue;
    }
    if (raw.startsWith('rename to ')) {
      current.path = raw.slice('rename to '.length).trim();
      continue;
    }
    if (raw.startsWith('+++ b/')) {
      current.path = raw.slice('+++ b/'.length).trim();
      continue;
    }

    const hunk = HUNK.exec(raw);
    if (hunk) {
      oldLine = Number(hunk[1]);
      newLine = Number(hunk[3]);
      continue;
    }

    if (raw.startsWith('+') && !raw.startsWith('+++')) {
      current.added.push({ line: newLine, text: raw.slice(1) });
      newLine += 1;
    } else if (raw.startsWith('-') && !raw.startsWith('---')) {
      current.removed.push({ line: oldLine, text: raw.slice(1) });
      oldLine += 1;
    } else if (raw.startsWith(' ')) {
      oldLine += 1;
      newLine += 1;
    }
  }

  push();
  return files.filter((f) => f.added.length > 0 || f.removed.length > 0 || f.status === 'deleted');
}

// `diff --git a/x b/x` is ambiguous when a path contains spaces; the +++ header that
// follows is authoritative, so this is only a fallback for binary and mode-only entries.
function pathFromHeader(header: string): string {
  const match = /^diff --git a\/(.+?) b\/(.+)$/.exec(header);
  return match?.[2] ?? header.slice('diff --git '.length);
}

export async function diffFromGit(range: string, cwd: string): Promise<ChangedFile[]> {
  const args = ['diff', '--no-color', '--no-ext-diff', '--find-renames', '--unified=0'];
  if (range) args.push(range);
  try {
    const { stdout } = await run('git', args, { cwd, maxBuffer: 64 * 1024 * 1024 });
    return parseUnifiedDiff(stdout);
  } catch (error) {
    throw new GitError(
      `git ${args.join(' ')} failed. Is ${cwd} a git repository, and is "${range}" a valid range?`,
      error,
    );
  }
}

export async function assertGitRepo(cwd: string): Promise<void> {
  try {
    await run('git', ['rev-parse', '--is-inside-work-tree'], { cwd });
  } catch (error) {
    throw new GitError(`${cwd} is not inside a git repository.`, error);
  }
}
