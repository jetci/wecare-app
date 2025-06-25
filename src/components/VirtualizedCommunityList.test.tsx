import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import VirtualizedCommunityList from './VirtualizedCommunityList';
import * as hooks from '@/hooks/useCommunities';

// Mock RoleGuard to simply render children
type Props = { children: React.ReactNode };
jest.mock('@/components/RoleGuard', () => ({
  __esModule: true,
  default: ({ children }: Props) => <>{children}</>,
}));

// Sample data
const mockData = [
  { name: 'Community A' },
  { name: 'Community B' },
  { name: 'Community C' },
];

describe('VirtualizedCommunityList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders skeleton placeholders when loading', () => {
    jest.spyOn(hooks, 'useCommunities').mockReturnValue({ data: [], loading: true, error: null });
    render(<VirtualizedCommunityList />);
    const skeletons = screen.getAllByTestId('community-skeleton');
    expect(skeletons).toHaveLength(5);
  });

  it('shows error message on error state', async () => {
    jest.spyOn(hooks, 'useCommunities').mockReturnValue({ data: [], loading: false, error: 'Failed load' });
    render(<VirtualizedCommunityList />);
    const errorEl = await screen.findByTestId('community-error');
    expect(errorEl).toHaveTextContent('Failed load');
  });

  it('renders virtualized list items when data is loaded', async () => {
    jest.spyOn(hooks, 'useCommunities').mockReturnValue({ data: mockData, loading: false, error: null });
    render(<VirtualizedCommunityList />);
    await waitFor(() => {
      const list = screen.getByTestId('community-virtualized-list');
      expect(list).toBeInTheDocument();
      const items = screen.getAllByTestId('community-item');
      expect(items.length).toBeGreaterThan(0);
    });
  });
});
