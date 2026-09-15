import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      include: ['src/**'],
      thresholds: { lines: 80, functions: 80, branches: 70 },
    },
  },
});
