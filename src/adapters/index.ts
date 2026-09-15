import type { Adapter, AdapterInput, Claim } from '../types.js';
import { jsonlTranscript } from './jsonl.js';
import { plainText } from './plain-text.js';

export const adapters: Adapter[] = [jsonlTranscript, plainText];

export function selectAdapter(input: AdapterInput): Adapter {
  const match = adapters.find((adapter) => adapter.detect(input));
  // plainText accepts everything, so this is unreachable unless the registry is edited.
  if (!match) throw new Error('No adapter matched the transcript.');
  return match;
}

export function extractFrom(input: AdapterInput): { adapter: Adapter; claims: Claim[] } {
  const adapter = selectAdapter(input);
  return { adapter, claims: adapter.extract(input) };
}

export { jsonlTranscript, plainText };
