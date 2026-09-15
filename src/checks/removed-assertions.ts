import type { Check, Evidence } from '../types.js';
import { profileFor, isTestFile } from '../lang/registry.js';
import { countMatches, finding, snippet } from './util.js';

export const removedAssertions: Check = {
  id: 'removed-assertions',
  title: 'Assertions removed from existing tests',
  contradicts: ['tests-pass'],
  run: ({ files }) => {
    const evidence: Evidence[] = [];

    for (const file of files) {
      if (file.status !== 'modified' || !isTestFile(file.path)) continue;
      const profile = profileFor(file.path);
      if (!profile) continue;

      const removed = countMatches(file.removed, profile.assertion);
      const added = countMatches(file.added, profile.assertion);
      if (removed <= added) continue;

      const sample = file.removed.find((line) => profile.assertion.test(line.text));
      evidence.push({
        file: file.path,
        line: sample?.line ?? null,
        snippet: `${removed - added} assertion(s) removed, e.g. ${snippet(sample?.text ?? '')}`,
      });
    }

    return finding(
      'removed-assertions',
      'high',
      'A test file ends this change with fewer assertions than it started with.',
      evidence,
      ['tests-pass'],
    );
  },
};
