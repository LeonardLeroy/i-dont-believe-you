#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { text } from 'node:stream/consumers';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { extractFrom } from './adapters/index.js';
import { checks } from './checks/index.js';
import { assertGitRepo, diffFromGit, GitError } from './git/diff.js';
import { installSkill, targetById, targets } from './install-skill.js';
import { toJson } from './report/json.js';
import { toTerminal } from './report/terminal.js';
import { exitCode, judge } from './verdict.js';

const HELP = `i-dont-believe-you: compare what a coding agent claimed against what the diff shows

Usage
  i-dont-believe-you [options]
  i-dont-believe-you install-skill --target <id>
  idby [options]

Options
  -t, --transcript <path>  Agent transcript. Reads stdin when piped and no path is given.
  -r, --range <range>      git diff range. Default: $IDBY_BASE, or HEAD when that is unset.
                           HEAD only holds while nobody has committed since the work started:
                           pin a base the agent cannot move, such as the merge-base of the
                           pull request, and the checks survive the agent committing its work.
  -C, --cwd <dir>          Repository directory. Default: current directory.
      --only <ids>         Run only these checks, comma separated.
      --skip <ids>         Skip these checks, comma separated.
      --strict             Exit non-zero on any finding, not just contradicted claims.
      --json               Emit a machine-readable report.
      --list-checks        Print the available checks and exit.
  -h, --help               Show this help.
  -v, --version            Print the version.

install-skill
      --target <id>        Agent to install the skill for. Omit to list the known targets.
      --dest <dir>         Install into an arbitrary directory instead.

Exit codes
  0  no claim contradicted
  1  at least one claim contradicted (or any finding with --strict)
  2  could not run`;

async function readVersion(): Promise<string> {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = await readFile(join(here, '..', 'package.json'), 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed === 'object' && parsed !== null && 'version' in parsed) {
    const { version } = parsed;
    if (typeof version === 'string') return version;
  }
  return '0.0.0';
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return '';
  return text(process.stdin);
}

function splitList(value: string | undefined): string[] {
  return value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function fail(message: string): never {
  console.error(message);
  process.exit(2);
}

async function installSkillCommand(
  target: string | undefined,
  dest: string | undefined,
): Promise<void> {
  if (dest) {
    console.log(`Installed to ${await installSkill(dest)}`);
    return;
  }
  const match = target === undefined ? undefined : targetById(target);
  if (!match) {
    const known = targets.map((t) => `  ${t.id.padEnd(14)} ${t.label} (${t.dir})`).join('\n');
    fail(`Pass --target <id> or --dest <dir>. Known targets:\n${known}`);
  }
  console.log(`Installed to ${await installSkill(match.dir)}`);
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    options: {
      transcript: { type: 'string', short: 't' },
      range: { type: 'string', short: 'r' },
      cwd: { type: 'string', short: 'C' },
      only: { type: 'string' },
      skip: { type: 'string' },
      target: { type: 'string' },
      dest: { type: 'string' },
      strict: { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      'list-checks': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
      version: { type: 'boolean', short: 'v', default: false },
    },
    allowPositionals: true,
    strict: true,
  });

  if (positionals[0] === 'install-skill') {
    await installSkillCommand(values.target, values.dest);
    return;
  }
  if (positionals.length > 0) {
    fail(`Unknown command: ${positionals[0] ?? ''}. Run --help.`);
  }

  if (values.help) {
    console.log(HELP);
    return;
  }
  if (values.version) {
    console.log(await readVersion());
    return;
  }
  if (values['list-checks']) {
    for (const check of checks) console.log(`${check.id.padEnd(20)} ${check.title}`);
    return;
  }

  const cwd = values.cwd ?? process.cwd();
  const only = splitList(values.only);
  const skip = splitList(values.skip);

  const unknown = [...only, ...skip].filter((id) => !checks.some((check) => check.id === id));
  if (unknown.length > 0) {
    fail(`Unknown check(s): ${unknown.join(', ')}. Run --list-checks to see the available ids.`);
  }

  const raw = values.transcript ? await readTranscript(values.transcript) : await readStdin();
  if (!raw.trim()) {
    fail('No transcript given. Pass --transcript <path> or pipe the agent output into stdin.');
  }

  await assertGitRepo(cwd);
  const range = values.range ?? process.env['IDBY_BASE'] ?? 'HEAD';
  const files = await diffFromGit(range, cwd);
  if (files.length === 0) {
    reportEmptyDiff(range, values.json);
    return;
  }
  const { claims } = extractFrom({ raw, path: values.transcript ?? null });

  const verdict = judge({ files, claims, only, skip });
  console.log(values.json ? JSON.stringify(toJson(verdict), null, 2) : toTerminal(verdict));
  process.exit(exitCode(verdict, values.strict));
}

function reportEmptyDiff(range: string, json: boolean): void {
  const message = `Nothing was compared: "${range}" is an empty diff, so no check ran. This is not a pass. Pass --range <base>, for example --range origin/main...HEAD, or set IDBY_BASE to the commit the work started from.`;
  console.log(
    json ? JSON.stringify({ version: 1, status: 'empty-diff', range, message }, null, 2) : message,
  );
}

async function readTranscript(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return fail(`Cannot read transcript at ${path}.`);
  }
}

main().catch((error: unknown) => {
  if (error instanceof GitError) fail(error.message);
  fail(error instanceof Error ? error.message : String(error));
});
