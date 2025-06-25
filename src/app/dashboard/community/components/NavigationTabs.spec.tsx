import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import * as nextNavigation from 'next/navigation';
import NavigationTabs from './NavigationTabs';

// Clean test suite for NavigationTabs
// Uses vi.spyOn to mock usePathname and asserts data-testid and active class

describe('NavigationTabs', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('highlights Dashboard tab when path is /dashboard/community', () => {
    vi.spyOn(nextNavigation, 'usePathname').mockReturnValue('/dashboard/community');
    render(<NavigationTabs />);
    const dashboardTab = screen.getByTestId('tab-dashboard');
    expect(dashboardTab).toHaveClass('border-b-2 text-blue-600');
  });

  it('highlights History tab when path is /dashboard/community/history', () => {
    vi.spyOn(nextNavigation, 'usePathname').mockReturnValue('/dashboard/community/history');
    render(<NavigationTabs />);
    const historyTab = screen.getByTestId('tab-history');
    expect(historyTab).toHaveClass('border-b-2 text-blue-600');
  });
});
