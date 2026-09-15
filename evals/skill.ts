import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface SkillCheck {
  id: string;
  command: string;
  /** When set, the check has fired only if its output equals this literal. */
  firesOn: string | null;
}

const MARKER =
  /<!--\s*check:\s*([a-z0-9-]+)(?:\s+fires-on=([^>]*?))?\s*-->\s*```bash\r?\n([\s\S]*?)```/g;

export function skillPath(): string {
  return join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    'skills',
    'verify-before-claiming',
    'SKILL.md',
  );
}

export function parseChecks(markdown: string): SkillCheck[] {
  const checks: SkillCheck[] = [];
  for (const match of markdown.matchAll(MARKER)) {
    const [, id, firesOn, command] = match;
    if (!id || !command) continue;
    checks.push({ id, command: command.trim(), firesOn: firesOn?.trim() ?? null });
  }
  return checks;
}

export async function loadChecks(): Promise<SkillCheck[]> {
  return parseChecks(await readFile(skillPath(), 'utf8'));
}

export function hasFired(check: SkillCheck, output: string): boolean {
  const trimmed = output.trim();
  if (check.firesOn !== null) return trimmed === check.firesOn;
  return trimmed.length > 0;
}
