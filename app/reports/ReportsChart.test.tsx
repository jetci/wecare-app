import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
// Mock Recharts components to simplify rendering
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line-component" />,  
  XAxis: () => <div data-testid="x-axis" />,  
  YAxis: () => <div data-testid="y-axis" />,  
  Tooltip: () => <div data-testid="tooltip" />,  
  Legend: () => <div data-testid="legend" />,  
  CartesianGrid: () => <div data-testid="grid" />
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportsChart from './ReportsChart';

describe('ReportsChart Component', () => {
  it('renders empty state when no data', () => {
    render(<ReportsChart data={[]} />);
    expect(screen.getByTestId('reports-chart-empty')).toHaveTextContent('ไม่มีข้อมูลกราฟ');
  });

  it('renders chart structure when data is provided', () => {
    const mockData = [
      { name: 'Jan', value: 100 },
      { name: 'Feb', value: 200 }
    ];
    render(<ReportsChart data={mockData} />);

    expect(screen.getByTestId('reports-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-component')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });
});

