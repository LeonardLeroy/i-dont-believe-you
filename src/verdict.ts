import type { ChangedFile, Check, Claim, ContradictedClaim, Finding, Verdict } from './types.js';
import { checks as allChecks } from './checks/index.js';

export interface JudgeOptions {
  files: ChangedFile[];
  claims: Claim[];
  only?: string[];
  skip?: string[];
  checks?: Check[];
}

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export function selectChecks(options: JudgeOptions): Check[] {
  const pool = options.checks ?? allChecks;
  const only = options.only?.length ? new Set(options.only) : null;
  const skip = new Set(options.skip ?? []);
  return pool.filter((check) => (only ? only.has(check.id) : true) && !skip.has(check.id));
}

export function judge(options: JudgeOptions): Verdict {
  const { files, claims } = options;
  const context = { files, claims };

  const findings: Finding[] = [];
  for (const check of selectChecks(options)) {
    findings.push(...check.run(context));
  }
  findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const contradicted: ContradictedClaim[] = [];
  const used = new Set<Finding>();

  for (const claim of claims) {
    const matched = findings.filter((f) => f.contradicts.includes(claim.kind));
    if (matched.length === 0) continue;
    matched.forEach((f) => used.add(f));
    contradicted.push({ claim, findings: matched });
  }

  return {
    claims,
    findings,
    contradicted,
    unclaimed: findings.filter((f) => !used.has(f)),
  };
}

export function exitCode(verdict: Verdict, strict: boolean): number {
  if (verdict.contradicted.length > 0) return 1;
  if (strict && verdict.findings.length > 0) return 1;
  return 0;
}
