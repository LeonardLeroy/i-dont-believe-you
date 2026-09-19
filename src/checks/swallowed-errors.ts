import type { Check, ChangedFile, Evidence } from '../types.js';
import { isTestFile, profileFor } from '../lang/registry.js';
import { finding, scan, snippet } from './util.js';

const OPENS_HANDLER = /catch\s*(\([^)]*\))?\s*\{\s*$|except[^:]*:\s*$|if\s+err\s*!=\s*nil\s*\{\s*$/;
const CLOSES_EMPTY = /^\s*(\}\s*(finally\s*\{)?|pass|\.\.\.)\s*$/;

export const swallowedErrors: Check = {
  id: 'swallowed-errors',
  title: 'Errors silently discarded',
  contradicts: ['fully-implemented'],
  run: ({ files }) =>
    finding(
      'swallowed-errors',
      'medium',
      'Error handling was added that discards the error without acting on it.',
      [
        ...scan({ files, skipTestFiles: true, pattern: (p) => p.swallowedError }),
        ...splitOverTwoLines(files),
      ],
      ['fully-implemented'],
    ),
};

// Most formatters write the empty handler across two lines, which a per-line pattern cannot see.
function splitOverTwoLines(files: ChangedFile[]): Evidence[] {
  const evidence: Evidence[] = [];

  for (const file of files) {
    if (file.status === 'deleted') continue;
    if (!profileFor(file.path) || isTestFile(file.path)) continue;

    for (let i = 0; i < file.added.length - 1; i += 1) {
      const open = file.added[i];
      const close = file.added[i + 1];
      if (!open || !close || close.line !== open.line + 1) continue;
      if (!OPENS_HANDLER.test(open.text) || !CLOSES_EMPTY.test(close.text)) continue;
      evidence.push({
        file: file.path,
        line: open.line,
        snippet: `${snippet(open.text)} ${close.text.trim()}`,
      });
    }
  }

  return evidence;
}
