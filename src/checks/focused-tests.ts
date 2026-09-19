import type { Check } from '../types.js';
import { finding, scan } from './util.js';

export const focusedTests: Check = {
  id: 'focused-tests',
  title: 'Tests focused, silencing the rest of the file',
  contradicts: ['tests-pass', 'tests-added'],
  run: ({ files }) =>
    finding(
      'focused-tests',
      'high',
      'A test was focused, so every other test in that file no longer runs.',
      scan({ files, onlyTestFiles: true, pattern: (p) => p.focusMarker }),
      ['tests-pass', 'tests-added'],
    ),
};
