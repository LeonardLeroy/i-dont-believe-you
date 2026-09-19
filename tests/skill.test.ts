import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hasFired, loadChecks, parseChecks, skillPath, type SkillCheck } from '../evals/skill.js';

const check = (over: Partial<SkillCheck> = {}): SkillCheck => ({
  id: 'x',
  command: 'true',
  firesOn: null,
  ...over,
});

describe('SKILL.md', () => {
  it('exposes every documented check to the eval harness', async () => {
    const ids = (await loadChecks()).map((c) => c.id);
    expect(ids).toEqual([
      'disabled-test',
      'hollow-assertion',
      'assertions-dropped',
      'test-file-gone',
      'swallowed-error',
      'no-test-touched',
      'test-name-gone',
      'focused-test',
    ]);
  });

  it('gives every bash block a marker', async () => {
    const markdown = await readFile(skillPath(), 'utf8');
    const blocks = markdown.match(/```bash/g) ?? [];
    const checks = parseChecks(markdown);
    // The "Locating a hit" block is a helper, not a check.
    expect(blocks.length).toBe(checks.length + 1);
  });

  it('keeps the commands runnable from a shell', async () => {
    for (const parsed of await loadChecks()) {
      expect(parsed.command).toMatch(/^git |^R=\$\(git |^comm -23 <\(git /);
      expect(parsed.command).not.toContain('PASTE');
    }
  });
});

describe('eval coverage', () => {
  it('exercises every check in at least one case', async () => {
    const dir = join(import.meta.dirname, '..', 'evals', 'cases');
    const names = (await readdir(dir, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    const fired = new Set<string>();
    for (const name of names) {
      const raw = await readFile(join(dir, name, 'expected.json'), 'utf8');
      for (const id of (JSON.parse(raw) as { fires: string[] }).fires) fired.add(id);
    }

    const uncovered = (await loadChecks()).map((c) => c.id).filter((id) => !fired.has(id));
    expect(uncovered).toEqual([]);
  });
});

describe('parseChecks', () => {
  it('reads the id and the command', () => {
    const parsed = parseChecks('<!-- check: foo -->\n\n```bash\ngit diff\n```\n');
    expect(parsed).toEqual([{ id: 'foo', command: 'git diff', firesOn: null }]);
  });

  it('reads an explicit fires-on literal', () => {
    const parsed = parseChecks(
      '<!-- check: bar fires-on=NOTHING HERE -->\n\n```bash\ngit diff\n```\n',
    );
    expect(parsed[0]?.firesOn).toBe('NOTHING HERE');
  });

  it('ignores a bash block with no marker', () => {
    expect(parseChecks('```bash\ngit diff\n```\n')).toEqual([]);
  });

  // A Windows checkout with core.autocrlf rewrites the file, which used to find zero checks.
  it('reads a file checked out with CRLF line endings', () => {
    const lf = '<!-- check: foo -->\n\n```bash\ngit diff\n```\n';
    expect(parseChecks(lf.replace(/\n/g, '\r\n'))).toEqual([
      { id: 'foo', command: 'git diff', firesOn: null },
    ]);
  });
});

describe('hasFired', () => {
  it('fires on any output by default', () => {
    expect(hasFired(check(), '+ it.skip(\n')).toBe(true);
    expect(hasFired(check(), '   \n')).toBe(false);
  });

  it('fires only on the literal when fires-on is set', () => {
    const c = check({ firesOn: 'NO TEST FILE CHANGED' });
    expect(hasFired(c, 'NO TEST FILE CHANGED\n')).toBe(true);
    expect(hasFired(c, 'src/a.test.ts\n')).toBe(false);
    expect(hasFired(c, '')).toBe(false);
  });
});
