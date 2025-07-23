import React, { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';

/**
 * Render component wrapped with global providers (Auth, Theme, etc.)
 */
export function renderWithProviders(ui: ReactElement) {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
}
