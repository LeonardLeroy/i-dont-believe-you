import { cp, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { targets } from '../src/install-skill.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILL_NAME = 'verify-before-claiming';
const SOURCE = join(ROOT, 'skills', SKILL_NAME);

async function filesUnder(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { recursive: true, withFileTypes: true })) {
    if (entry.isFile()) out.push(relative(dir, join(entry.parentPath, entry.name)));
  }
  return out.sort();
}

async function differs(source: string, copy: string): Promise<string[]> {
  const problems: string[] = [];
  let copied: string[];
  try {
    copied = await filesUnder(copy);
  } catch {
    return [`${relative(ROOT, copy)} is missing`];
  }

  const original = await filesUnder(source);
  for (const name of original) {
    if (!copied.includes(name)) {
      problems.push(`${relative(ROOT, join(copy, name))} is missing`);
      continue;
    }
    const [a, b] = await Promise.all([
      readFile(join(source, name), 'utf8'),
      readFile(join(copy, name), 'utf8'),
    ]);
    if (a !== b) problems.push(`${relative(ROOT, join(copy, name))} is out of date`);
  }
  for (const name of copied) {
    if (!original.includes(name))
      problems.push(`${relative(ROOT, join(copy, name))} is not in skills/`);
  }
  return problems;
}

async function main(): Promise<void> {
  const check = process.argv.includes('--check');
  const problems: string[] = [];

  for (const target of targets) {
    const copy = join(ROOT, target.dir, SKILL_NAME);
    if (check) {
      problems.push(...(await differs(SOURCE, copy)));
      continue;
    }
    await rm(copy, { recursive: true, force: true });
    await mkdir(copy, { recursive: true });
    await cp(SOURCE, copy, { recursive: true });
    console.log(`synced ${relative(ROOT, copy)}`);
  }

  if (!check) return;
  if (problems.length === 0) {
    console.log(`${targets.length} target directories match skills/${SKILL_NAME}`);
    return;
  }
  for (const problem of problems) console.error(problem);
  console.error('\nRun `npm run sync-skill` and commit the result.');
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
