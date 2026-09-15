import type { Adapter, AdapterInput, Claim } from '../types.js';
import { extractClaims } from '../claims/extract.js';

const ASSISTANT_ROLES = new Set(['assistant', 'agent', 'model']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function collectText(node: unknown, out: string[]): void {
  if (typeof node === 'string') return;
  if (Array.isArray(node)) {
    for (const item of node) collectText(item, out);
    return;
  }
  if (!isRecord(node)) return;

  const text = node['text'];
  if (typeof text === 'string') out.push(text);
  const content = node['content'];
  if (typeof content === 'string') out.push(content);

  for (const value of Object.values(node)) {
    if (typeof value !== 'string') collectText(value, out);
  }
}

function isAssistantEntry(entry: Record<string, unknown>): boolean {
  const type = entry['type'];
  if (typeof type === 'string' && ASSISTANT_ROLES.has(type)) return true;
  const role = entry['role'];
  if (typeof role === 'string' && ASSISTANT_ROLES.has(role)) return true;
  const message = entry['message'];
  return isRecord(message) && isAssistantEntry(message);
}

function parseLines(raw: string): Record<string, unknown>[] {
  const entries: Record<string, unknown>[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('{')) continue;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (isRecord(parsed)) entries.push(parsed);
    } catch {
      // A truncated trailing line is normal while a session is still being written.
    }
  }
  return entries;
}

// Agents nest assistant text differently, so this walks the entry rather than assuming a path.
export const jsonlTranscript: Adapter = {
  id: 'jsonl-transcript',
  detect: (input: AdapterInput) => parseLines(input.raw).some(isAssistantEntry),
  extract: (input: AdapterInput): Claim[] => {
    const chunks: string[] = [];
    for (const entry of parseLines(input.raw)) {
      if (isAssistantEntry(entry)) collectText(entry, chunks);
    }
    return extractClaims(chunks.join('\n'), 'jsonl-transcript');
  },
};
