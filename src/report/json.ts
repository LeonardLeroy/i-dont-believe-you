import type { Verdict } from '../types.js';

export interface JsonReport {
  version: 1;
  summary: { claims: number; findings: number; contradicted: number };
  claims: Verdict['claims'];
  contradicted: { claim: Verdict['claims'][number]; findings: string[] }[];
  findings: Verdict['findings'];
}

export function toJson(verdict: Verdict): JsonReport {
  return {
    version: 1,
    summary: {
      claims: verdict.claims.length,
      findings: verdict.findings.length,
      contradicted: verdict.contradicted.length,
    },
    claims: verdict.claims,
    contradicted: verdict.contradicted.map(({ claim, findings }) => ({
      claim,
      findings: findings.map((f) => f.check),
    })),
    findings: verdict.findings,
  };
}
