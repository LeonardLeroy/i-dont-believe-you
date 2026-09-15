import type { Check } from '../types.js';
import { finding, scan } from './util.js';

export const skippedTests: Check = {
  id: 'skipped-tests',
  title: 'Tests disabled in this change',
  contradicts: ['tests-pass', 'tests-added'],
  run: ({ files }) =>
    finding(
      'skipped-tests',
      'high',
      'Test cases were skipped, ignored or marked as expected failures.',
      scan({ files, onlyTestFiles: true, pattern: (p) => p.skipMarker }),
      ['tests-pass', 'tests-added'],
    ),
};
