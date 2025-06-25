import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  test: {
    // exclude Playwright spec files and e2e directory
    exclude: ['**/node_modules/**', '**/e2e/**', 'src/app/api/**/*.test.ts'],
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
    },
  },
})
