import type { ClaimKind } from '../types.js';

export interface ClaimPattern {
  kind: ClaimKind;
  pattern: RegExp;
}

// Deliberately narrow. A missed claim costs nothing; a false one makes every
// report suspect, which is the one failure this tool cannot afford.
export const claimPatterns: ClaimPattern[] = [
  {
    kind: 'tests-pass',
    pattern:
      /\b(all\s+)?(the\s+)?(unit\s+|integration\s+|e2e\s+)?tests?\s+(are\s+|is\s+|now\s+)?(pass(es|ing|ed)?|green|succeed(s|ed|ing)?)\b/i,
  },
  { kind: 'tests-pass', pattern: /\b(test\s+suite|suite)\s+(is\s+)?(pass(es|ing)?|green)\b/i },
  { kind: 'tests-pass', pattern: /\b\d+\s+(tests?|specs?)\s+pass(ed|ing)?\b/i },
  { kind: 'tests-pass', pattern: /\ball\s+(tests?\s+)?green\b/i },

  {
    kind: 'tests-added',
    pattern:
      /\b(added|wrote|created|introduced)\s+(new\s+|a\s+|some\s+)?(unit\s+|integration\s+)?tests?\b/i,
  },
  { kind: 'tests-added', pattern: /\btest\s+coverage\s+(is\s+)?(added|improved|increased)\b/i },
  { kind: 'tests-added', pattern: /\bcovered\s+(this|it|the\s+\w+)\s+with\s+tests?\b/i },

  {
    kind: 'build-passes',
    pattern: /\b(the\s+)?build\s+(is\s+|now\s+)?(pass(es|ing)?|succeed(s|ed)?|green|clean)\b/i,
  },
  {
    kind: 'build-passes',
    pattern: /\b(it\s+)?compiles?\s+(cleanly|without\s+errors?|fine|successfully)\b/i,
  },
  {
    kind: 'build-passes',
    pattern: /\b(type\s?check|tsc|typecheck)\w*\s+(is\s+)?(pass(es|ing)?|clean)\b/i,
  },
  { kind: 'build-passes', pattern: /\bno\s+(type|compil(er|ation))\s+errors?\b/i },

  {
    kind: 'nothing-else-changed',
    pattern: /\b(no|without)\s+other\s+(changes?|modifications?|files?)\b/i,
  },
  { kind: 'nothing-else-changed', pattern: /\bonly\s+(touched|changed|modified)\b/i },
  {
    kind: 'nothing-else-changed',
    pattern: /\bnothing\s+else\s+(was\s+)?(changed|modified|touched)\b/i,
  },

  { kind: 'fully-implemented', pattern: /\bfully\s+implement(ed|s)?\b/i },
  {
    kind: 'fully-implemented',
    pattern: /\bno\s+(remaining\s+)?(todos?|stubs?|placeholders?)\s+(left|remain(ing)?)?\b/i,
  },
  { kind: 'fully-implemented', pattern: /\bready\s+(to|for)\s+(merge|review|ship)\b/i },
  { kind: 'fully-implemented', pattern: /\bimplementation\s+is\s+complete\b/i },
];
