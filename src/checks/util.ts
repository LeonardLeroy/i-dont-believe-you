import type { ChangedFile, Evidence, Finding, Severity, ClaimKind } from '../types.js';
import { profileFor, isTestFile, type LanguageProfile } from '../lang/registry.js';

const MAX_EVIDENCE = 20;
const SNIPPET_LENGTH = 160;

export function snippet(text: string): string {
  return text.trim().slice(0, SNIPPET_LENGTH);
}

export interface ScanOptions {
  files: ChangedFile[];
  onlyTestFiles?: boolean;
  skipTestFiles?: boolean;
  pattern: (profile: LanguageProfile) => RegExp;
  side?: 'added' | 'removed';
}

export function scan(options: ScanOptions): Evidence[] {
  const { files, onlyTestFiles = false, skipTestFiles = false, pattern, side = 'added' } = options;
  const evidence: Evidence[] = [];

  for (const file of files) {
    if (file.status === 'deleted') continue;
    const profile = profileFor(file.path);
    if (!profile) continue;
    const testFile = isTestFile(file.path);
    if (onlyTestFiles && !testFile) continue;
    if (skipTestFiles && testFile) continue;

    const regex = pattern(profile);
    for (const line of file[side]) {
      if (!regex.test(line.text)) continue;
      evidence.push({ file: file.path, line: line.line, snippet: snippet(line.text) });
      if (evidence.length >= MAX_EVIDENCE) return evidence;
    }
  }

  return evidence;
}

export function finding(
  check: string,
  severity: Severity,
  summary: string,
  evidence: Evidence[],
  contradicts: ClaimKind[],
): Finding[] {
  return evidence.length > 0 ? [{ check, severity, summary, evidence, contradicts }] : [];
}

export function countMatches(lines: { text: string }[], regex: RegExp): number {
  return lines.reduce((total, line) => (regex.test(line.text) ? total + 1 : total), 0);
}
