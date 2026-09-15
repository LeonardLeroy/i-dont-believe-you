import { describe, expect, it } from 'vitest';
import { parseUnifiedDiff } from '../src/git/diff.js';

const MODIFIED = `diff --git a/src/auth.ts b/src/auth.ts
index 1111111..2222222 100644
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,2 +10,3 @@ export function login() {
-  return verify(token);
+  // relaxed for now
+  return true;
`;

const ADDED = `diff --git a/src/new.ts b/src/new.ts
new file mode 100644
index 0000000..3333333
--- /dev/null
+++ b/src/new.ts
@@ -0,0 +1,2 @@
+export const a = 1;
+export const b = 2;
`;

const DELETED = `diff --git a/tests/old.test.ts b/tests/old.test.ts
deleted file mode 100644
index 4444444..0000000
--- a/tests/old.test.ts
+++ /dev/null
@@ -1,2 +0,0 @@
-it('works', () => {
-});
`;

const RENAMED = `diff --git a/src/a.ts b/src/b.ts
similarity index 90%
rename from src/a.ts
rename to src/b.ts
--- a/src/a.ts
+++ b/src/b.ts
@@ -1 +1 @@
-const a = 1;
+const b = 1;
`;

describe('parseUnifiedDiff', () => {
  it('reads added and removed lines with their line numbers', () => {
    const [changed] = parseUnifiedDiff(MODIFIED);
    expect(changed?.path).toBe('src/auth.ts');
    expect(changed?.status).toBe('modified');
    expect(changed?.removed).toEqual([{ line: 10, text: '  return verify(token);' }]);
    expect(changed?.added).toEqual([
      { line: 10, text: '  // relaxed for now' },
      { line: 11, text: '  return true;' },
    ]);
  });

  it('marks new files as added', () => {
    const [changed] = parseUnifiedDiff(ADDED);
    expect(changed?.status).toBe('added');
    expect(changed?.added).toHaveLength(2);
  });

  it('keeps deleted files even though they have no additions', () => {
    const [changed] = parseUnifiedDiff(DELETED);
    expect(changed?.status).toBe('deleted');
    expect(changed?.path).toBe('tests/old.test.ts');
  });

  it('follows renames to the new path and records the old one', () => {
    const [changed] = parseUnifiedDiff(RENAMED);
    expect(changed?.status).toBe('renamed');
    expect(changed?.path).toBe('src/b.ts');
    expect(changed?.oldPath).toBe('src/a.ts');
  });

  it('parses several files in one diff', () => {
    expect(parseUnifiedDiff(`${MODIFIED}${ADDED}`)).toHaveLength(2);
  });

  it('returns nothing for empty input', () => {
    expect(parseUnifiedDiff('')).toEqual([]);
  });

  it('ignores hunks with no changed lines', () => {
    const noop = `diff --git a/src/x.ts b/src/x.ts
--- a/src/x.ts
+++ b/src/x.ts
@@ -1 +1 @@
 unchanged
`;
    expect(parseUnifiedDiff(noop)).toEqual([]);
  });
});
