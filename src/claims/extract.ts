import type { Claim, ClaimKind } from '../types.js';
import { claimPatterns } from './patterns.js';

const MAX_SENTENCE_LENGTH = 300;

export function splitSentences(text: string): { text: string; line: number }[] {
  const out: { text: string; line: number }[] = [];
  const lines = text.split(/\r?\n/);

  lines.forEach((rawLine, index) => {
    const stripped = stripMarkdown(rawLine);
    if (!stripped.trim()) return;
    for (const piece of stripped.split(/(?<=[.!?])\s+/)) {
      const trimmed = piece.trim();
      if (trimmed) out.push({ text: trimmed.slice(0, MAX_SENTENCE_LENGTH), line: index + 1 });
    }
  });

  return out;
}

function stripMarkdown(line: string): string {
  return line
    .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
    .replace(/^\s*[-*+]\s+/, '')
    .replace(/^\s*#{1,6}\s+/, '')
    .replace(/[*_~]/g, '');
}

export function extractClaims(text: string, adapter: string): Claim[] {
  const claims: Claim[] = [];
  const seen = new Set<string>();

  for (const { text: sentence, line } of splitSentences(text)) {
    if (isNegated(sentence)) continue;
    for (const { kind, pattern } of claimPatterns) {
      if (!pattern.test(sentence)) continue;
      const key = `${kind}:${line}`;
      if (seen.has(key)) continue;
      seen.add(key);
      claims.push({ kind, text: sentence, adapter, line });
    }
  }

  return claims;
}

const NEGATIONS =
  /\b(do(es)?\s*n[o']t|did\s*n[o']t|cannot|can[o']?t|won[o']?t|should|would|will|if|unless|make\s+sure|need\s+to|let['\u2019]?s|todo)\b/i;

/** "the tests don't pass yet" and "make sure the tests pass" are not claims of success. */
function isNegated(sentence: string): boolean {
  return NEGATIONS.test(sentence);
}

export function claimKinds(claims: Claim[]): Set<ClaimKind> {
  return new Set(claims.map((c) => c.kind));
}
