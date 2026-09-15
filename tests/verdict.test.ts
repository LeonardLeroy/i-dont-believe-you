import { describe, expect, it } from 'vitest';
import type { Claim } from '../src/types.js';
import { exitCode, judge, selectChecks } from '../src/verdict.js';
import { file } from './helpers.js';

const testsPass: Claim = { kind: 'tests-pass', text: 'All tests pass.', adapter: 'test', line: 3 };

describe('judge', () => {
  it('pairs a contradicted claim with the findings that disprove it', () => {
    const files = [file({ path: 'src/a.test.ts', added: ['  it.skip("retries", () => {'] })];
    const verdict = judge({ files, claims: [testsPass] });

    expect(verdict.contradicted).toHaveLength(1);
    expect(verdict.contradicted[0]?.claim).toBe(testsPass);
    expect(verdict.contradicted[0]?.findings.map((f) => f.check)).toContain('skipped-tests');
    expect(verdict.unclaimed).toEqual([]);
  });

  it('reports findings that contradict nothing as unclaimed', () => {
    const files = [file({ path: 'src/a.ts', added: ['// TODO: finish this'] })];
    const verdict = judge({ files, claims: [testsPass] });

    expect(verdict.contradicted).toEqual([]);
    expect(verdict.unclaimed.map((f) => f.check)).toEqual(['leftover-stubs']);
  });

  it('sorts findings by severity', () => {
    const files = [
      file({ path: 'src/a.ts', added: ['// TODO: later'] }),
      file({ path: 'src/a.test.ts', added: ['  it.skip("x", () => {'] }),
    ];
    const severities = judge({ files, claims: [] }).findings.map((f) => f.severity);
    expect(severities).toEqual([...severities].sort());
    expect(severities[0]).toBe('high');
  });

  it('finds nothing in a clean change', () => {
    const files = [file({ path: 'src/a.ts', added: ['export const a = 1;'] })];
    const verdict = judge({ files, claims: [testsPass] });
    expect(verdict.findings).toEqual([]);
    expect(verdict.contradicted).toEqual([]);
  });
});

describe('selectChecks', () => {
  const base = { files: [], claims: [] };

  it('runs every check by default', () => {
    expect(selectChecks(base).length).toBeGreaterThan(1);
  });

  it('honours only', () => {
    expect(selectChecks({ ...base, only: ['skipped-tests'] }).map((c) => c.id)).toEqual([
      'skipped-tests',
    ]);
  });

  it('honours skip', () => {
    expect(selectChecks({ ...base, skip: ['skipped-tests'] }).map((c) => c.id)).not.toContain(
      'skipped-tests',
    );
  });
});

describe('exitCode', () => {
  const clean = { claims: [], findings: [], contradicted: [], unclaimed: [] };

  it('is 0 when nothing is contradicted', () => {
    expect(exitCode(clean, false)).toBe(0);
  });

  it('is 1 when a claim is contradicted', () => {
    const files = [file({ path: 'src/a.test.ts', added: ['  it.skip("x", () => {'] })];
    expect(exitCode(judge({ files, claims: [testsPass] }), false)).toBe(1);
  });

  it('is 1 under --strict for a finding that contradicts nothing', () => {
    const files = [file({ path: 'src/a.ts', added: ['// TODO: later'] })];
    const verdict = judge({ files, claims: [] });
    expect(exitCode(verdict, false)).toBe(0);
    expect(exitCode(verdict, true)).toBe(1);
  });
});
