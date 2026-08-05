import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/{contexts,domain,services,spikes}/**/*.{test,spec}.{ts,tsx}'],
  },
});
