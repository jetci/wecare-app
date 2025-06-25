import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportButtons from './ExportButtons';
import * as exportLib from '@/lib/export';

describe('ExportButtons', () => {
  const rides = [{ id: '1', origin: 'A', description: 'D', status: 'PENDING', date: '' }];

  beforeEach(() => vi.spyOn(exportLib, 'exportCSV').mockImplementation(vi.fn()));
  beforeEach(() => vi.spyOn(exportLib, 'exportPDF').mockImplementation(vi.fn()));

  it('calls exportCSV on button click', () => {
    render(<ExportButtons rides={rides as any} />);
    fireEvent.click(screen.getByTestId('export-csv'));
    expect(exportLib.exportCSV).toHaveBeenCalledWith(rides);
  });

  it('calls exportPDF on button click', () => {
    render(<ExportButtons rides={rides as any} />);
    fireEvent.click(screen.getByTestId('export-pdf'));
    expect(exportLib.exportPDF).toHaveBeenCalledWith(rides);
  });
});
