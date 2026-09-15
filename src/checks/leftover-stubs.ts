import type { Check } from '../types.js';
import { finding, scan } from './util.js';

const STUB =
  /\b(TODO|FIXME|XXX|HACK)\b|\bnot\s+implemented\b|\bNotImplementedError\b|\btodo!\s*\(|\bunimplemented!\s*\(/i;

export const leftoverStubs: Check = {
  id: 'leftover-stubs',
  title: 'Unfinished work left in the change',
  contradicts: ['fully-implemented'],
  run: ({ files }) =>
    finding(
      'leftover-stubs',
      'low',
      'The change adds placeholders or unimplemented branches.',
      scan({ files, skipTestFiles: true, pattern: () => STUB }),
      ['fully-implemented'],
    ),
};
