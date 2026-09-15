import { cp, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Target {
  id: string;
  label: string;
  /** Directory, relative to the project root, where the agent looks for skills. */
  dir: string;
}

// Community-maintained. If your agent reads skills from somewhere else, correct the entry
// rather than working around it with --dest.
export const targets: Target[] = [
  { id: 'claude-code', label: 'Claude Code', dir: '.claude/skills' },
  { id: 'codex', label: 'Codex CLI', dir: '.codex/skills' },
  { id: 'cursor', label: 'Cursor', dir: '.cursor/skills' },
  { id: 'opencode', label: 'opencode', dir: '.opencode/skills' },
  { id: 'agents', label: 'AGENTS.md-compatible agents', dir: '.agents/skills' },
];

const SKILL_NAME = 'verify-before-claiming';

export function skillSource(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', SKILL_NAME);
}

export function targetById(id: string): Target | undefined {
  return targets.find((target) => target.id === id);
}

export async function installSkill(destination: string): Promise<string> {
  const into = resolve(destination, SKILL_NAME);
  await mkdir(into, { recursive: true });
  await cp(skillSource(), into, { recursive: true });
  return into;
}
