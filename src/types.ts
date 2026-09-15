export type ClaimKind =
  'tests-pass' | 'tests-added' | 'build-passes' | 'nothing-else-changed' | 'fully-implemented';

export interface Claim {
  kind: ClaimKind;
  text: string;
  adapter: string;
  line: number;
}

export type FileStatus = 'added' | 'modified' | 'deleted' | 'renamed';

export interface DiffLine {
  /** Line number in the post-change file for additions, pre-change for removals. */
  line: number;
  text: string;
}

export interface ChangedFile {
  path: string;
  oldPath: string | null;
  status: FileStatus;
  added: DiffLine[];
  removed: DiffLine[];
}

export interface Evidence {
  file: string;
  line: number | null;
  snippet: string;
}

export type Severity = 'high' | 'medium' | 'low';

export interface Finding {
  check: string;
  severity: Severity;
  summary: string;
  evidence: Evidence[];
  contradicts: ClaimKind[];
}

export interface CheckContext {
  files: ChangedFile[];
  claims: Claim[];
}

export interface Check {
  id: string;
  title: string;
  /** Drives claim/finding pairing in the verdict. */
  contradicts: ClaimKind[];
  run(ctx: CheckContext): Finding[];
}

export interface AdapterInput {
  raw: string;
  path: string | null;
}

export interface Adapter {
  id: string;
  detect(input: AdapterInput): boolean;
  extract(input: AdapterInput): Claim[];
}

export interface ContradictedClaim {
  claim: Claim;
  findings: Finding[];
}

export interface Verdict {
  claims: Claim[];
  findings: Finding[];
  contradicted: ContradictedClaim[];
  /** Findings that disprove nothing the agent said. */
  unclaimed: Finding[];
}
