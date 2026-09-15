import type { Adapter, AdapterInput } from '../types.js';
import { extractClaims } from '../claims/extract.js';

export const plainText: Adapter = {
  id: 'plain-text',
  detect: () => true,
  extract: (input: AdapterInput) => extractClaims(input.raw, 'plain-text'),
};
