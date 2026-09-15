import { describe, expect, it } from 'vitest';
import { extractFrom, jsonlTranscript, plainText, selectAdapter } from '../src/adapters/index.js';

const claudeStyle = [
  JSON.stringify({ type: 'user', message: { role: 'user', content: 'fix the auth bug' } }),
  JSON.stringify({
    type: 'assistant',
    message: { role: 'assistant', content: [{ type: 'text', text: 'Fixed it. All tests pass.' }] },
  }),
].join('\n');

const codexStyle = [
  JSON.stringify({ role: 'user', content: 'add pagination' }),
  JSON.stringify({ role: 'assistant', content: 'Done, I added tests for the new branch.' }),
].join('\n');

describe('jsonl adapter', () => {
  it('detects and reads a nested assistant message', () => {
    const input = { raw: claudeStyle, path: 'session.jsonl' };
    expect(jsonlTranscript.detect(input)).toBe(true);
    expect(jsonlTranscript.extract(input).map((c) => c.kind)).toEqual(['tests-pass']);
  });

  it('reads a flat assistant message', () => {
    const input = { raw: codexStyle, path: null };
    expect(jsonlTranscript.extract(input).map((c) => c.kind)).toEqual(['tests-added']);
  });

  it('ignores user turns', () => {
    const raw = JSON.stringify({ role: 'user', content: 'make sure all tests pass' });
    expect(jsonlTranscript.extract({ raw, path: null })).toEqual([]);
  });

  it('survives a truncated trailing line', () => {
    const raw = `${claudeStyle}\n{"type":"assistant","mess`;
    expect(jsonlTranscript.extract({ raw, path: null })).toHaveLength(1);
  });

  it('does not claim plain prose', () => {
    expect(jsonlTranscript.detect({ raw: 'All tests pass.', path: null })).toBe(false);
  });
});

describe('plain-text adapter', () => {
  it('reads the whole input', () => {
    expect(plainText.extract({ raw: 'All tests pass.', path: null }).map((c) => c.kind)).toEqual([
      'tests-pass',
    ]);
  });
});

describe('selectAdapter', () => {
  it('prefers the jsonl adapter for session logs', () => {
    expect(selectAdapter({ raw: claudeStyle, path: null }).id).toBe('jsonl-transcript');
  });

  it('falls back to plain text', () => {
    expect(selectAdapter({ raw: 'All tests pass.', path: null }).id).toBe('plain-text');
  });

  it('reports which adapter ran', () => {
    const { adapter, claims } = extractFrom({ raw: claudeStyle, path: null });
    expect(adapter.id).toBe('jsonl-transcript');
    expect(claims[0]?.adapter).toBe('jsonl-transcript');
  });
});
