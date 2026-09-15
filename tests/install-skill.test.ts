import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installSkill, skillSource, targetById, targets } from '../src/install-skill.js';

describe('targets', () => {
  it('has a unique id and a relative directory per entry', () => {
    const ids = targets.map((target) => target.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const target of targets) {
      expect(target.dir.startsWith('/')).toBe(false);
      expect(target.dir).toMatch(/skills$/);
    }
  });

  it('looks up a known target and rejects an unknown one', () => {
    expect(targetById('claude-code')?.dir).toBe('.claude/skills');
    expect(targetById('nope')).toBeUndefined();
  });
});

describe('installSkill', () => {
  let dest: string;

  beforeEach(async () => {
    dest = await mkdtemp(join(tmpdir(), 'idby-'));
  });

  afterEach(async () => {
    await rm(dest, { recursive: true, force: true });
  });

  it('copies the skill under the destination', async () => {
    const into = await installSkill(dest);
    expect(into).toBe(join(dest, 'verify-before-claiming'));
    const skill = await readFile(join(into, 'SKILL.md'), 'utf8');
    expect(skill).toContain('name: verify-before-claiming');
  });

  it('overwrites an existing install rather than failing', async () => {
    await installSkill(dest);
    await expect(installSkill(dest)).resolves.toContain('verify-before-claiming');
  });
});

describe('skillSource', () => {
  it('points at a directory that exists', async () => {
    expect((await stat(skillSource())).isDirectory()).toBe(true);
  });
});
