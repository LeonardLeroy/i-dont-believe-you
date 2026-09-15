import type { Check, Evidence } from '../types.js';
import { profileFor, isTestFile } from '../lang/registry.js';
import { countMatches, finding, snippet } from './util.js';

export const deletedTests: Check = {
  id: 'deleted-tests',
  title: 'Test cases removed',
  contradicts: ['tests-pass', 'tests-added'],
  run: ({ files }) => {
    const evidence: Evidence[] = [];

    for (const file of files) {
      if (!isTestFile(file.path)) continue;
      const profile = profileFor(file.path);
      if (!profile) continue;

      if (file.status === 'deleted') {
        evidence.push({ file: file.path, line: null, snippet: 'test file deleted' });
        continue;
      }

      const removed = countMatches(file.removed, profile.testDeclaration);
      const added = countMatches(file.added, profile.testDeclaration);
      if (removed <= added) continue;

      const sample = file.removed.find((line) => profile.testDeclaration.test(line.text));
      evidence.push({
        file: file.path,
        line: sample?.line ?? null,
        snippet: `${removed - added} test(s) removed, e.g. ${snippet(sample?.text ?? '')}`,
      });
    }

    return finding('deleted-tests', 'high', 'Test cases disappeared in this change.', evidence, [
      'tests-pass',
      'tests-added',
    ]);
  },
};
