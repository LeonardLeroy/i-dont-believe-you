import { describe, expect, it } from 'vitest';
import { extractClaims, splitSentences } from '../src/claims/extract.js';

function kinds(text: string): string[] {
  return extractClaims(text, 'test').map((claim) => claim.kind);
}

describe('splitSentences', () => {
  it('splits on sentence and line boundaries', () => {
    const parts = splitSentences('First one. Second one.\nThird one.');
    expect(parts.map((p) => p.text)).toEqual(['First one.', 'Second one.', 'Third one.']);
    expect(parts.map((p) => p.line)).toEqual([1, 1, 2]);
  });

  it('strips markdown decoration and inline code', () => {
    const [part] = splitSentences('- **All tests pass** after `npm test`');
    expect(part?.text).toBe('All tests pass after');
  });
});

describe('extractClaims', () => {
  it('finds success claims about tests', () => {
    expect(kinds('All tests pass now.')).toContain('tests-pass');
    expect(kinds('The test suite is green.')).toContain('tests-pass');
    expect(kinds('42 tests passed.')).toContain('tests-pass');
  });

  it('finds claims that tests were written', () => {
    expect(kinds('I added tests for the new branch.')).toContain('tests-added');
    expect(kinds('Covered this with tests.')).toContain('tests-added');
  });

  it('finds build and completeness claims', () => {
    expect(kinds('The build is green.')).toContain('build-passes');
    expect(kinds('No type errors.')).toContain('build-passes');
    expect(kinds('Implementation is complete.')).toContain('fully-implemented');
    expect(kinds('Ready to merge.')).toContain('fully-implemented');
  });

  it('ignores negated, conditional and instructional sentences', () => {
    expect(kinds("The tests don't pass yet.")).toEqual([]);
    expect(kinds('Make sure all tests pass before merging.')).toEqual([]);
    expect(kinds('If the tests pass, ship it.')).toEqual([]);
    expect(kinds('I will add tests next.')).toEqual([]);
    expect(kinds('TODO: the build passes only on Linux.')).toEqual([]);
  });

  it('records the line and the sentence verbatim', () => {
    const [claim] = extractClaims('Doing the work.\nAll tests pass.', 'test');
    expect(claim?.line).toBe(2);
    expect(claim?.text).toBe('All tests pass.');
    expect(claim?.adapter).toBe('test');
  });

  it('reports one claim per kind and line', () => {
    expect(extractClaims('All tests pass and the tests are green.', 'test')).toHaveLength(1);
  });

  it('returns nothing for text without claims', () => {
    expect(kinds('Refactored the parser into two modules.')).toEqual([]);
  });
});
