import type { Check } from '../types.js';
import { finding, scan } from './util.js';

const INTEGRATION_PATH = /(^|[/])(e2e|integration|acceptance|functional)([/.-])/i;

export const mockSmuggling: Check = {
  id: 'mock-smuggling',
  title: 'Mocks introduced in end-to-end tests',
  contradicts: ['tests-pass'],
  run: ({ files }) => {
    const integrationFiles = files.filter((file) => INTEGRATION_PATH.test(file.path));
    return finding(
      'mock-smuggling',
      'medium',
      'A suite meant to exercise the real system now mocks part of it.',
      scan({ files: integrationFiles, onlyTestFiles: true, pattern: (p) => p.mockSetup }),
      ['tests-pass'],
    );
  },
};
