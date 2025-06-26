import React, { type ReactNode } from 'react';
import {
  render as rtlRender,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
  waitForElementToBeRemoved,
  cleanup,
  type RenderOptions,
} from '@testing-library/react';
// Removed renderHook import; hook testing should use render from @testing-library/react or custom wrappers
import { vi } from 'vitest';
import RoleGuard from '@/components/RoleGuard';
import { AuthProvider } from '@/context/AuthContext';
import { Role } from '@/types/roles';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (to: string) => window.history.pushState({}, '', to),
    replace: (to: string) => window.history.pushState({}, '', to),
    prefetch: vi.fn(),
    refresh: vi.fn(),
    asPath: window.location.pathname,
  }),
  usePathname: () => window.location.pathname,
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

// Mock Google Maps API
vi.mock('@react-google-maps/api', () => ({
  GoogleMap: (props: any) => <div data-testid="mock-google-map" {...props} />,
  Marker: (props: any) => <div data-testid="mock-google-marker" {...props} />,
  useJsApiLoader: () => ({ isLoaded: true, loadError: null }),
}));

interface ProvidersProps {
  children: ReactNode;
  route?: string;
  role?: string;
}

function AllProviders({ children, route = '/', role = 'ADMIN' }: ProvidersProps) {
  window.history.pushState({}, '', route);
  const roleEnum = (Role as any)[role.toUpperCase() as keyof typeof Role] as Role;
  return (
    <AuthProvider>
      <RoleGuard allowedRoles={[roleEnum]}>{children}</RoleGuard>
    </AuthProvider>
  );
}

function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { route?: string; role?: string }
) {
  return rtlRender(ui, {
    wrapper: ({ children }) => <AllProviders {...options}>{children}</AllProviders>,
  });
}

export {
  renderWithProviders,
  renderWithProviders as render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
  waitForElementToBeRemoved,
  cleanup,
  // renderHook removed,
};
