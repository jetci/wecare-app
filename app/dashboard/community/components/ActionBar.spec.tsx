import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
afterEach(cleanup);
import ActionBar from './ActionBar';

describe('ActionBar', () => {
  const defaultProps = {
    searchText: '',
    statusFilter: 'ALL' as const,
    onSearchChange: vi.fn(),
    onFilterChange: vi.fn(),
    onNewRequest: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    render(<ActionBar {...defaultProps} />);
  });

  it('calls onNewRequest when clicking New Request button', () => {
    const btn = screen.getByTestId('new-request-btn');
    fireEvent.click(btn);
    expect(defaultProps.onNewRequest).toHaveBeenCalled();
  });

  it('calls onSearchChange on input change', () => {
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('abc');
  });

  it('renders filter buttons and calls onFilterChange', () => {
    const filters = ['filter-all', 'filter-pending', 'filter-in-progress', 'filter-completed'];
    filters.forEach(testId => {
      const btn = screen.getByTestId(testId);
      fireEvent.click(btn);
      expect(defaultProps.onFilterChange).toHaveBeenCalled();
    });
  });

  it('highlights active filter', () => {
    // rerender with statusFilter = 'PENDING'
    const props = { ...defaultProps, statusFilter: 'PENDING' as const };
    // clear previous DOM before rerender
    cleanup();
    render(<ActionBar {...props} />);
    const pendingButtons = screen.getAllByTestId('filter-pending');
    // find the active button by class
    const activeBtn = pendingButtons.find(btn => btn.classList.contains('bg-blue-500'));
    expect(activeBtn).toBeDefined();
  });
});

