import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import useSWR, { SWRConfig } from 'swr';
import ReportsPage from './page';
import { vi } from 'vitest';

// Mock SWR to include SWRConfig and default hook
vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();
  return {
    ...actual,
    SWRConfig: actual.SWRConfig,
    default: vi.fn(),
  };
});

const mockSWR = useSWR as any;

describe('ReportsPage', () => {
  it('แสดงข้อความ prompt เมื่อยังไม่ได้เลือก filter', async () => {
    mockSWR.mockReturnValue({ data: undefined, error: undefined });
    render(<ReportsPage />);
    expect(await screen.findByTestId('reports-prompt')).toBeInTheDocument();
  });

  it('แสดงข้อความ error เมื่อโหลดข้อมูลล้มเหลว', async () => {
    mockSWR.mockReturnValue({ data: undefined, error: new Error() });
    render(<ReportsPage />);
    expect(await screen.findByTestId('reports-error')).toBeInTheDocument();
  });

  it('แสดงข้อมูลเมื่อมี data', async () => {
    const sample = [{ id: '1', name: 'Test' }];
    mockSWR.mockReturnValue({ data: sample, error: undefined });
    render(<ReportsPage />);
    // Chart should render
    expect(await screen.findByTestId('reports-chart')).toBeInTheDocument();
    // JSON preview
    const jsonPre = await screen.findByTestId('reports-json');
    // Expect exact JSON string preserving whitespace and newlines
    expect(jsonPre.textContent).to.equal(JSON.stringify(sample, null, 2));
    // Export buttons enabled
    expect(await screen.findByTestId('export-csv')).not.toBeDisabled();
    expect(await screen.findByTestId('export-pdf')).not.toBeDisabled();
  });

  it('ปุ่ม Export ถูก disable เมื่อไม่มี data หรือกำลังโหลด', async () => {
    mockSWR.mockReturnValue({ data: undefined, error: undefined });
    render(<ReportsPage />);
    const csvBtn = await screen.findByTestId('export-csv');
    const pdfBtn = await screen.findByTestId('export-pdf');
    expect(csvBtn).toBeDisabled();
    expect(pdfBtn).toBeDisabled();
  });
});

