import type { Check } from '../types.js';
import { finding, scan } from './util.js';

export const hollowAssertions: Check = {
  id: 'hollow-assertions',
  title: 'Assertions that cannot fail',
  contradicts: ['tests-pass', 'tests-added'],
  run: ({ files }) =>
    finding(
      'hollow-assertions',
      'high',
      'Assertions were added that pass regardless of the code under test.',
      scan({ files, onlyTestFiles: true, pattern: (p) => p.hollowAssertion }),
      ['tests-pass', 'tests-added'],
    ),
};
