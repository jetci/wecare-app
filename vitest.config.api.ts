import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  test: {
    globals: true,
    environment: 'node', // Crucial for API tests
    setupFiles: './vitest.setup.api.ts', // Use the API-specific setup
    include: ['src/app/api/**/*.test.ts'], // Only include API tests
    // Optional: if you want separate coverage for API tests
    // coverage: {
    //   provider: 'istanbul',
    //   reporter: ['text', 'html'],
    //   reportsDirectory: './coverage/api'
    // },
  },
});
