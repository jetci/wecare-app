import React from 'react'
import { expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest';

// Expose global variables for tests
Object.assign(globalThis, {
  expect,
  jest: vi,
  IS_REACT_ACT_ENVIRONMENT: true,
})

// Patch Location.prototype.indexOf for legacy code checks
Object.defineProperty(Location.prototype, 'indexOf', {
  value(this: Location, segment: string) {
    return this.href.indexOf(segment)
  },
  writable: true,
  configurable: true,
})

// Stub window.navigator properties
Object.defineProperty(window.navigator, 'userAgent', {
  value: window.navigator.userAgent || 'node',
  configurable: true,
})
Object.defineProperty(window.navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
  configurable: true,
})

// Mock Next.js Link component
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => React.createElement('a', { href }, children),
}))

// Mock Next.js navigation hooks
let currentPath = '/'
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (to: string) => { currentPath = to; return Promise.resolve() },
    replace: (to: string) => { currentPath = to; return Promise.resolve() },
    prefetch: vi.fn(),
    refresh: vi.fn(),
    asPath: currentPath,
  }),
  usePathname: () => currentPath,
  useSearchParams: () => new URLSearchParams(currentPath.split('?')[1] || ''),
}))

// Mock RoleGuard to bypass authorization
vi.mock('@/components/RoleGuard', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}))

// Stub ResizeObserver for jsdom environment
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock @react-google-maps/api to return React components
vi.mock('@react-google-maps/api', () => ({
  __esModule: true,
  GoogleMap: ({ children }: any) => React.createElement('div', null, children),
  Marker: (props: any) => React.createElement('div', { 'data-testid': 'marker' }),
  InfoWindow: ({ children }: any) => React.createElement('div', null, children),
  LatLng: () => React.createElement('div', null),
}));

// Mock AuthContext for tests to provide default role
vi.mock('@/context/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({ role: 'COMMUNITY' }),
}))

// Mock react-hot-toast to output testable DOM nodes
vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: (msg: string) => {
      const div = document.createElement('div')
      div.textContent = msg
      div.setAttribute('data-testid', 'toast-error')
      document.body.appendChild(div)
    },
    success: (msg: string) => {
      const div = document.createElement('div')
      div.textContent = msg
      div.setAttribute('data-testid', 'toast-success')
      document.body.appendChild(div)
    }
  }
}))
