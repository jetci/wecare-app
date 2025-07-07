// vitest.setup.tsx
import 'vitest'
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { vi, beforeAll } from 'vitest'
import { render } from '@testing-library/react'

// Mock Next.js navigation API
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/dummy',
    query: {},
  }),
  usePathname: () => '/dummy',
  useSearchParams: () => new URLSearchParams(),
}))

// Polyfill browser APIs
;(global as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(global as any).FileList = class FileList {
  length = 0
  item() { return null }
}

// Stub AuthContext
beforeAll(async () => {
  const actual = await vi.importActual('@/context/AuthContext')
  vi.mock('@/context/AuthContext', () => ({
    ...actual,
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useAuth: () => ({ user: { role: 'COMMUNITY' }, setRole: vi.fn() }),
  }))
})

// Global render helper
export function renderWithProviders(ui: React.ReactElement, options = {}) {
  const { AuthProvider } = require('@/context/AuthContext')
  return render(<AuthProvider>{ui}</AuthProvider>, options)
}
