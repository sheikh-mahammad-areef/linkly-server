//  ------------------------------------------------------------------
//  file: vitest.config.ts
//  Vitest test runner configuration
//  ------------------------------------------------------------------

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    sequence: {
      concurrent: false, // keep tests inside a file sequential
      shuffle: false, // extra safety: no random order
    },
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'tests/', '**/*.test.ts'],
    },
    testTimeout: 10000,
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
});
