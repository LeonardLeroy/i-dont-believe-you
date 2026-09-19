import { execFile } from 'node:child_process';
import { cp, mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { hasFired, loadChecks, type SkillCheck } from './skill.js';

const run = promisify(execFile);

interface Expected {
  fires: string[];
  /** Commits the `after` tree, which moves HEAD onto the change the checks are meant to catch. */
  commit?: boolean;
}

interface CaseResult {
  name: string;
  ok: boolean;
  problems: string[];
}

const CASES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'cases');

async function git(cwd: string, ...args: string[]): Promise<string> {
  const { stdout } = await run('git', args, { cwd });
  return stdout.trim();
}

/** Builds a repo whose base commit is `before/` and whose working tree is `after/`. */
async function stageCase(dir: string, commit: boolean): Promise<{ repo: string; base: string }> {
  const repo = await mkdtemp(join(tmpdir(), 'idby-eval-'));
  await git(repo, 'init', '-q', '-b', 'main');
  await git(repo, 'config', 'user.email', 'evals@example.com');
  await git(repo, 'config', 'user.name', 'evals');
  await git(repo, 'config', 'core.autocrlf', 'false');

  await cp(join(dir, 'before'), repo, { recursive: true });
  await git(repo, 'add', '-A');
  await git(repo, 'commit', '-qm', 'before');

  // Wipe tracked files first so a case can express a deletion by omission.
  await git(repo, 'rm', '-rq', '--cached', '.');
  for (const entry of await readdir(repo, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    await rm(join(repo, entry.name), { recursive: true, force: true });
  }
  await cp(join(dir, 'after'), repo, { recursive: true });
  await git(repo, 'add', '-A');

  const base = await git(repo, 'rev-parse', 'HEAD');
  if (commit) await git(repo, 'commit', '-qm', 'after');

  return { repo, base };
}

async function runCheck(check: SkillCheck, repo: string, base: string): Promise<string> {
  try {
    const { stdout } = await run('bash', ['-c', check.command], {
      cwd: repo,
      env: { ...process.env, IDBY_BASE: base },
    });
    return stdout;
  } catch (error) {
    // grep exits 1 when it matches nothing, and the `[ ... ] && echo` form exits 1 when silent.
    const stdout = (error as { stdout?: string }).stdout;
    return stdout ?? '';
  }
}

async function runCase(name: string, checks: SkillCheck[]): Promise<CaseResult> {
  const dir = join(CASES_DIR, name);
  const expected = JSON.parse(await readFile(join(dir, 'expected.json'), 'utf8')) as Expected;
  const { repo, base } = await stageCase(dir, expected.commit ?? false);
  const problems: string[] = [];

  try {
    const fired: string[] = [];
    for (const check of checks) {
      if (hasFired(check, await runCheck(check, repo, base))) fired.push(check.id);
    }
    for (const id of expected.fires) {
      if (!fired.includes(id)) problems.push(`expected to fire but did not: ${id}`);
    }
    for (const id of fired) {
      if (!expected.fires.includes(id)) problems.push(`fired unexpectedly: ${id}`);
    }
  } finally {
    // Windows keeps a handle on the git objects for a moment after the last command exits.
    await rm(repo, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }

  return { name, ok: problems.length === 0, problems };
}

async function main(): Promise<void> {
  const checks = await loadChecks();
  if (checks.length === 0) {
    console.error(
      'No checks found in SKILL.md. Every bash block needs a <!-- check: id --> marker.',
    );
    process.exit(1);
  }
  console.log(`${checks.length} checks from SKILL.md: ${checks.map((c) => c.id).join(', ')}\n`);

  const entries = await readdir(CASES_DIR, { withFileTypes: true });
  const names = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  if (names.length === 0) {
    console.error('No eval cases found.');
    process.exit(1);
  }

  let failed = 0;
  for (const name of names) {
    const result = await runCase(name, checks);
    if (!result.ok) failed += 1;
    console.log(`${result.ok ? 'pass' : 'FAIL'}  ${result.name}`);
    for (const problem of result.problems) console.log(`      ${problem}`);
  }

  console.log(`\n${names.length - failed}/${names.length} cases pass`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
