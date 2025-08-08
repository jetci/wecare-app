import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import PatientTable, { Patient } from '@/components/dashboard/community/PatientTable';
import { apiFetch } from '@/lib/apiFetch';

// Mock the apiFetch function
vi.mock('@/lib/apiFetch');
const mockedApiFetch = apiFetch as Mock;

// Mock child UI components to isolate the PatientTable logic
vi.mock('@/components/ui/Table', () => ({
  Table: ({ data, columns }: { data: Patient[], columns: any[] }) => (
    <table>
      <thead>
        <tr>
          {columns.map(col => <th key={col.key}>{col.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            {columns.map(col => <td key={col.key}>{col.render ? col.render(row[col.key as keyof Patient], row) : row[col.key as keyof Patient]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}));

vi.mock('@/components/ui/SearchInput', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }: { value: string, onChange: (v: string) => void, placeholder: string }) => (
    <input 
      type="search" 
      placeholder={placeholder} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
    />
  )
}));

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Alice',
    age: 30,
    condition: 'Good',
    status: 'Stable',
    lastCheckIn: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Bob',
    age: 45,
    condition: 'Critical',
    status: 'Critical',
    lastCheckIn: new Date().toISOString(),
  },
];

describe('PatientTable', () => {
  const onRowClickMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockedApiFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ patients: mockPatients, totalPages: 2 }),
    });
  });

  it('should show loading skeleton initially and fetch data', async () => {
    render(<PatientTable onRowClick={onRowClickMock} />);
    expect(screen.getByRole('status')).toBeInTheDocument(); // Assuming skeleton has role='status'

    await act(async () => {
        vi.runAllTimers();
    });

    expect(mockedApiFetch).toHaveBeenCalledWith('/api/patients?page=1&limit=10&search=');
  });

  it('should display patients data after successful fetch', async () => {
    render(<PatientTable onRowClick={onRowClickMock} />);
    await act(async () => {
        vi.runAllTimers();
    });

    await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('should display error message on fetch failure', async () => {
    mockedApiFetch.mockRejectedValue(new Error('API Error'));
    render(<PatientTable onRowClick={onRowClickMock} />);
    await act(async () => {
        vi.runAllTimers();
    });

    await waitFor(() => {
        expect(screen.getByText(/Failed to fetch patients/i)).toBeInTheDocument();
    });
  });

  it('should call onRowClick with patient id when a row is clicked', async () => {
    render(<PatientTable onRowClick={onRowClickMock} />);
    await act(async () => {
        vi.runAllTimers();
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Alice'));
    });

    expect(onRowClickMock).toHaveBeenCalledWith('1');
  });

  it('should handle pagination correctly', async () => {
    render(<PatientTable onRowClick={onRowClickMock} />);
    await act(async () => { vi.runAllTimers(); });

    // Go to next page
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    });
    await act(async () => { vi.runAllTimers(); });
    await waitFor(() => {
        expect(mockedApiFetch).toHaveBeenCalledWith('/api/patients?page=2&limit=10&search=');
    });

    // Go to previous page
    fireEvent.click(screen.getByRole('button', { name: /Previous/i }));
    await act(async () => { vi.runAllTimers(); });
    await waitFor(() => {
        expect(mockedApiFetch).toHaveBeenCalledWith('/api/patients?page=1&limit=10&search=');
    });
  });

  it('should refetch data when search term changes', async () => {
    render(<PatientTable onRowClick={onRowClickMock} />);
    await act(async () => { vi.runAllTimers(); }); // Initial fetch

    const searchInput = screen.getByPlaceholderText(/ค้นหาด้วยชื่อ.../i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    await act(async () => { vi.runAllTimers(); });

    await waitFor(() => {
        expect(mockedApiFetch).toHaveBeenCalledWith('/api/patients?page=1&limit=10&search=test');
    });
  });
});
