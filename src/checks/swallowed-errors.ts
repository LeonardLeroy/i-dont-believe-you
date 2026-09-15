import type { Check } from '../types.js';
import { finding, scan } from './util.js';

export const swallowedErrors: Check = {
  id: 'swallowed-errors',
  title: 'Errors silently discarded',
  contradicts: ['fully-implemented'],
  run: ({ files }) =>
    finding(
      'swallowed-errors',
      'medium',
      'Error handling was added that discards the error without acting on it.',
      scan({ files, skipTestFiles: true, pattern: (p) => p.swallowedError }),
      ['fully-implemented'],
    ),
};
