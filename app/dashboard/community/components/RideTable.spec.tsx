import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import type { Ride } from '@/types/community';
import RideTable from './RideTable';

// Removed local Ride type; using community.Ride
const rides: Ride[] = [  // include patientId to match interface
  { id: '1', patientId: 'p1', origin: 'A', description: 'Desc A', status: 'PENDING', date: new Date().toISOString() },
  { id: '2', patientId: 'p2', origin: 'B', description: 'Desc B', status: 'COMPLETED', date: new Date().toISOString() }
];

describe('RideTable', () => {
  const onView = vi.fn();
  const onEdit = vi.fn();
  const onCancel = vi.fn();
  const onPrevPage = vi.fn();
  const onNextPage = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it('renders rows and actions', () => {
    render(
      <RideTable
        rides={rides}
        page={1}
        totalPages={2}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        onView={onView}
        onEdit={onEdit}
        onCancel={onCancel}
      />
    );
    rides.forEach(r => {
      if (r.origin) {
      expect(screen.getByText(r.origin)).toBeInTheDocument();
    }
      fireEvent.click(screen.getByTestId(`action-view-${r.id}`));
      expect(onView).toHaveBeenCalledWith(r.id);
    });
  });

  it('pagination buttons state and calls', () => {
    // first page: prev disabled
    render(<RideTable rides={rides} page={1} totalPages={2} onPrevPage={onPrevPage} onNextPage={onNextPage} onView={() => {}} onEdit={() => {}} onCancel={() => {}} />);
    expect(screen.getByTestId('pagination-prev')).toBeDisabled();
    const nextBtns = screen.getAllByTestId('pagination-next');
    expect(nextBtns[0]).not.toBeDisabled();
    fireEvent.click(nextBtns[0]);
    expect(onNextPage).toHaveBeenCalled();
    cleanup();

    // last page: next disabled
    render(<RideTable rides={rides} page={2} totalPages={2} onPrevPage={onPrevPage} onNextPage={onNextPage} onView={() => {}} onEdit={() => {}} onCancel={() => {}} />);
    const nextBtnsLast = screen.getAllByTestId('pagination-next');
    expect(nextBtnsLast[0]).toBeDisabled();
    const prevBtns = screen.getAllByTestId('pagination-prev');
    fireEvent.click(prevBtns[0]);
    expect(onPrevPage).toHaveBeenCalled();
  });
});

