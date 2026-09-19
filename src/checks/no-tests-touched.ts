import type { Check } from '../types.js';
import { isTestFile } from '../lang/registry.js';
import { finding } from './util.js';

export const noTestsTouched: Check = {
  id: 'no-tests-touched',
  title: 'Tests claimed but no test file changed',
  contradicts: ['tests-added'],
  run: ({ files, claims }) => {
    // An empty diff compared nothing, so it disproves nothing.
    if (files.length === 0) return [];
    if (!claims.some((claim) => claim.kind === 'tests-added')) return [];
    if (files.some((file) => isTestFile(file.path))) return [];

    return finding(
      'no-tests-touched',
      'high',
      'Tests were said to be added, but the change touches no test file.',
      [
        {
          file: '(diff)',
          line: null,
          snippet: `${files.length} file(s) changed, none of them tests`,
        },
      ],
      ['tests-added'],
    );
  },
};
