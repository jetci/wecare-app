// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
      include: [
        'src/app/dashboard/community/**/*.spec.tsx',
        'src/test/**/*.spec.tsx'
      ],
      // ปิดหลายเธรดเพื่อป้องกันหน่วยความจำล้น
      // @ts-ignore
      threads: false,
      reporters: [
        'default',
        ['json', { outputFile: 'test-report.json' }]
      ],


    globals: true,                   // enable describe/it/expect globally
    environment: 'jsdom',            // use jsdom for browser APIs
    setupFiles: ['./vitest.setup.tsx'], // correct .tsx extension
    testTimeout: 10000,
    passWithNoTests: true,              // 10s per test
  },
})
