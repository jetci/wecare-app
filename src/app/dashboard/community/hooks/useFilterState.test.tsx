import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFilterState } from './useFilterState';

type Item = { id: number; status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; name: string };
const items: Item[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  status: i % 3 === 0 ? 'PENDING' : i % 3 === 1 ? 'IN_PROGRESS' : 'COMPLETED',
  name: `Item${i + 1}`
}));

function FilterWrapper({ pageSize }: { pageSize: number }) {
  const { items: current, totalPages, page, setStatusFilter, setSearchText, nextPage, prevPage } =
    useFilterState({ items, getStatus: i => i.status, pageSize });

  return (
    <div>
      <div data-testid="length">{current.length}</div>
      <div data-testid="total">{totalPages}</div>
      <div data-testid="page">{page}</div>
      <button data-testid="filter" onClick={() => setStatusFilter('PENDING')}>Filter</button>
      <button data-testid="search" onClick={() => setSearchText('Item2')}>Search</button>
      <button data-testid="next" onClick={() => nextPage()}>Next</button>
      <button data-testid="prev" onClick={() => prevPage()}>Prev</button>
    </div>
  );
}

describe('useFilterState', () => {
  it('initializes with full list paged', () => {
    render(<FilterWrapper pageSize={10} />);
    expect(screen.getByTestId('length').textContent).to.equal('10');
    expect(screen.getByTestId('total').textContent).to.equal('3');
    expect(screen.getByTestId('page').textContent).to.equal('1');
  });

  it('filters by status', () => {
    render(<FilterWrapper pageSize={10} />);
    fireEvent.click(screen.getByTestId('filter'));
    const allP = items.filter(i => i.status === 'PENDING').length;
    expect(screen.getByTestId('length').textContent).to.equal(String(Math.min(allP, 10)));
    expect(screen.getByTestId('total').textContent).to.equal(String(Math.ceil(allP / 10)));
  });

  it('searches by text', () => {
    render(<FilterWrapper pageSize={50} />);
    fireEvent.click(screen.getByTestId('search'));
    expect(Number(screen.getByTestId('length').textContent)).toBeGreaterThan(0);
    expect(screen.getByTestId('total').textContent).to.equal('1');
  });

  it('paginates correctly', () => {
    render(<FilterWrapper pageSize={5} />);
    expect(screen.getByTestId('page').textContent).to.equal('1');
    fireEvent.click(screen.getByTestId('next'));
    expect(screen.getByTestId('page').textContent).to.equal('2');
    fireEvent.click(screen.getByTestId('prev'));
    expect(screen.getByTestId('page').textContent).to.equal('1');
  });
});

