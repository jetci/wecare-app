import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { KpiCard } from './KpiCard';

describe('KpiCard', () => {
  it('renders title and count with default color', () => {
    render(<KpiCard testId="kpi-test" title="Test" count={5} />);
    const card = screen.getByTestId('kpi-test');
    expect(card).toHaveTextContent('Test');
    expect(card).toHaveTextContent('5');
    // default color class
    expect(card).toHaveClass('bg-blue-500');
  });

  it('applies custom suffix and color', () => {
    render(
      <KpiCard
        testId="kpi-suffix"
        title="Custom"
        count={10}
        suffix="+"
        color="bg-red-500"
      />
    );
    const card = screen.getByTestId('kpi-suffix');
    expect(card).toHaveTextContent('10+');
    expect(card).toHaveClass('bg-red-500');
  });
});

