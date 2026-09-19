import { describe, expect, it } from 'vitest';
import type { Claim } from '../src/types.js';
import { deletedTests } from '../src/checks/deleted-tests.js';
import { focusedTests } from '../src/checks/focused-tests.js';
import { hollowAssertions } from '../src/checks/hollow-assertions.js';
import { leftoverStubs } from '../src/checks/leftover-stubs.js';
import { mockSmuggling } from '../src/checks/mock-smuggling.js';
import { noTestsTouched } from '../src/checks/no-tests-touched.js';
import { removedAssertions } from '../src/checks/removed-assertions.js';
import { skippedTests } from '../src/checks/skipped-tests.js';
import { swallowedErrors } from '../src/checks/swallowed-errors.js';
import { file } from './helpers.js';

const noClaims: Claim[] = [];

describe('skipped-tests', () => {
  it('flags a skip marker added to a test file', () => {
    const files = [
      file({ path: 'src/auth.test.ts', added: ['  it.skip("rejects bad tokens", () => {'] }),
    ];
    const [found] = skippedTests.run({ files, claims: noClaims });
    expect(found?.severity).toBe('high');
    expect(found?.evidence[0]?.file).toBe('src/auth.test.ts');
  });

  it('flags python and rust markers', () => {
    const files = [
      file({ path: 'tests/test_auth.py', added: ['@pytest.mark.skip(reason="flaky")'] }),
      file({ path: 'tests/auth.rs', added: ['#[ignore]'] }),
    ];
    expect(skippedTests.run({ files, claims: noClaims })[0]?.evidence).toHaveLength(2);
  });

  it('ignores skip-looking lines outside test files', () => {
    const files = [file({ path: 'src/queue.ts', added: ['const skip = (n) => n + 1;'] })];
    expect(skippedTests.run({ files, claims: noClaims })).toEqual([]);
  });

  it('leaves a focused test to the focused-tests check', () => {
    const files = [file({ path: 'src/auth.test.ts', added: ['  it.only("rejects", () => {'] })];
    expect(skippedTests.run({ files, claims: noClaims })).toEqual([]);
  });
});

describe('focused-tests', () => {
  it('flags a focused test and names focusing, not skipping', () => {
    const files = [file({ path: 'src/auth.test.ts', added: ['  it.only("rejects", () => {'] })];
    const [found] = focusedTests.run({ files, claims: noClaims });
    expect(found?.summary).toContain('focused');
    expect(found?.summary).not.toContain('skip');
  });

  it('flags the fdescribe form', () => {
    const files = [file({ path: 'src/auth.test.ts', added: ['fdescribe("auth", () => {'] })];
    expect(focusedTests.run({ files, claims: noClaims })).toHaveLength(1);
  });

  it('leaves an ordinary test alone', () => {
    const files = [file({ path: 'src/auth.test.ts', added: ['  it("rejects", () => {'] })];
    expect(focusedTests.run({ files, claims: noClaims })).toEqual([]);
  });
});

describe('hollow-assertions', () => {
  it('flags a tautological assertion', () => {
    const files = [file({ path: 'src/a.test.ts', added: ['    expect(true).toBe(true);'] })];
    expect(hollowAssertions.run({ files, claims: noClaims })).toHaveLength(1);
  });

  it('leaves a real assertion alone', () => {
    const files = [file({ path: 'src/a.test.ts', added: ['    expect(total).toBe(42);'] })];
    expect(hollowAssertions.run({ files, claims: noClaims })).toEqual([]);
  });

  // toBeDefined is weak, not tautological: it fails when the value is undefined.
  it('leaves toBeDefined alone', () => {
    const files = [file({ path: 'src/a.test.ts', added: ['    expect(user).toBeDefined();'] })];
    expect(hollowAssertions.run({ files, claims: noClaims })).toEqual([]);
  });
});

describe('removed-assertions', () => {
  it('flags a net loss of assertions in a test file', () => {
    const files = [
      file({
        path: 'src/a.test.ts',
        removed: ['  expect(a).toBe(1);', '  expect(b).toBe(2);'],
        added: ['  expect(a).toBe(1);'],
      }),
    ];
    const [found] = removedAssertions.run({ files, claims: noClaims });
    expect(found?.evidence[0]?.snippet).toContain('1 assertion(s) removed');
  });

  it('accepts a rewrite that keeps the assertion count', () => {
    const files = [
      file({
        path: 'src/a.test.ts',
        removed: ['  expect(a).toBe(1);'],
        added: ['  expect(a).toEqual(1);'],
      }),
    ];
    expect(removedAssertions.run({ files, claims: noClaims })).toEqual([]);
  });
});

describe('deleted-tests', () => {
  it('flags a removed test case', () => {
    const files = [file({ path: 'src/a.test.ts', removed: ['it("handles retries", () => {'] })];
    expect(deletedTests.run({ files, claims: noClaims })).toHaveLength(1);
  });

  it('flags a deleted test file', () => {
    const files = [file({ path: 'src/a.test.ts', status: 'deleted' })];
    const [found] = deletedTests.run({ files, claims: noClaims });
    expect(found?.evidence[0]?.snippet).toBe('test file deleted');
  });
});

describe('mock-smuggling', () => {
  it('flags a mock added inside an e2e suite', () => {
    const files = [file({ path: 'e2e/checkout.spec.ts', added: ["vi.mock('../src/payments');"] })];
    expect(mockSmuggling.run({ files, claims: noClaims })).toHaveLength(1);
  });

  it('allows mocks in ordinary unit tests', () => {
    const files = [file({ path: 'src/payments.test.ts', added: ["vi.mock('./gateway');"] })];
    expect(mockSmuggling.run({ files, claims: noClaims })).toEqual([]);
  });
});

describe('no-tests-touched', () => {
  const claim: Claim = { kind: 'tests-added', text: 'Added tests.', adapter: 'test', line: 1 };

  it('fires when tests were claimed but none changed', () => {
    const files = [file({ path: 'src/auth.ts', added: ['const x = 1;'] })];
    expect(noTestsTouched.run({ files, claims: [claim] })).toHaveLength(1);
  });

  it('stays quiet when a test file did change', () => {
    const files = [file({ path: 'src/auth.test.ts', added: ['it("works", () => {'] })];
    expect(noTestsTouched.run({ files, claims: [claim] })).toEqual([]);
  });

  it('stays quiet when nothing was claimed', () => {
    const files = [file({ path: 'src/auth.ts', added: ['const x = 1;'] })];
    expect(noTestsTouched.run({ files, claims: noClaims })).toEqual([]);
  });

  // An empty diff compared nothing, so reporting against it says more than the diff proves.
  it('stays quiet on an empty diff', () => {
    expect(noTestsTouched.run({ files: [], claims: [claim] })).toEqual([]);
  });
});

describe('swallowed-errors', () => {
  it('flags an empty catch added to source', () => {
    const files = [file({ path: 'src/api.ts', added: ['  } catch (e) {}'] })];
    expect(swallowedErrors.run({ files, claims: noClaims })).toHaveLength(1);
  });

  it('flags except: pass in python', () => {
    const files = [file({ path: 'src/api.py', added: ['except Exception: pass'] })];
    expect(swallowedErrors.run({ files, claims: noClaims })).toHaveLength(1);
  });

  it('flags an empty catch split over two lines by a formatter', () => {
    const files = [file({ path: 'src/api.ts', added: ['  } catch (e) {', '  }'] })];
    expect(swallowedErrors.run({ files, claims: noClaims })).toHaveLength(1);
  });

  it('flags a multi-line except that only passes', () => {
    const files = [file({ path: 'src/api.py', added: ['    except ValueError:', '        pass'] })];
    expect(swallowedErrors.run({ files, claims: noClaims })).toHaveLength(1);
  });

  it('stays quiet when the catch has a body', () => {
    const files = [
      file({ path: 'src/api.ts', added: ['  } catch (e) {', '    report(e);', '  }'] }),
    ];
    expect(swallowedErrors.run({ files, claims: noClaims })).toEqual([]);
  });

  it('ignores test files, where swallowing is often deliberate', () => {
    const files = [file({ path: 'src/api.test.ts', added: ['  } catch (e) {}'] })];
    expect(swallowedErrors.run({ files, claims: noClaims })).toEqual([]);
  });
});

describe('leftover-stubs', () => {
  it('flags a TODO added to source', () => {
    const files = [file({ path: 'src/api.ts', added: ['// TODO: handle pagination'] })];
    const [found] = leftoverStubs.run({ files, claims: noClaims });
    expect(found?.severity).toBe('low');
  });

  it('flags an unimplemented branch', () => {
    const files = [file({ path: 'src/api.rs', added: ['    todo!()'] })];
    expect(leftoverStubs.run({ files, claims: noClaims })).toHaveLength(1);
  });
});
