export type {
  Adapter,
  AdapterInput,
  ChangedFile,
  Check,
  CheckContext,
  Claim,
  ClaimKind,
  ContradictedClaim,
  DiffLine,
  Evidence,
  FileStatus,
  Finding,
  Severity,
  Verdict,
} from './types.js';

export { adapters, extractFrom, selectAdapter } from './adapters/index.js';
export { checks, checkById } from './checks/index.js';
export { extractClaims, splitSentences } from './claims/extract.js';
export { claimPatterns } from './claims/patterns.js';
export { assertGitRepo, diffFromGit, GitError, parseUnifiedDiff } from './git/diff.js';
export { installSkill, targetById, targets } from './install-skill.js';
export type { Target } from './install-skill.js';
export { isTestFile, listProfiles, profileFor } from './lang/registry.js';
export { exitCode, judge, selectChecks } from './verdict.js';
export { toJson } from './report/json.js';
export { toTerminal } from './report/terminal.js';
