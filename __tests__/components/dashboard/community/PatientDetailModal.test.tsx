import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import PatientDetailModal from '@/components/dashboard/community/PatientDetailModal';
import { apiFetch } from '@/lib/apiFetch';

// Mock the apiFetch function
vi.mock('@/lib/apiFetch');
const mockedApiFetch = apiFetch as Mock;

// Mock UI components
vi.mock('@/components/ui/Modal', () => ({ Modal: ({ open, onClose, title, children }: any) => open ? <div data-testid="modal"><h2 onClick={onClose}>{title}</h2>{children}</div> : null }));
vi.mock('@/components/ui/Button', () => ({ Button: (props: any) => <button {...props}>{props.children}</button> }));
vi.mock('@/components/ui/Alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div role="alert">{children}</div>,
  AlertTitle: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));
vi.mock('@/components/ui/Skeleton', () => ({ Skeleton: () => <div data-testid="skeleton">Loading...</div> }));
vi.mock('lucide-react', () => ({
    Terminal: () => <span>Icon</span>,
    Edit: () => <span>Icon</span>,
    Trash2: () => <span>Icon</span>,
}));

const mockPatient = {
  id: '123',
  name: 'John Doe',
  age: 45,
  condition: 'Stable',
  status: 'Active',
  lastCheckIn: new Date().toISOString(),
};

describe('PatientDetailModal', () => {
  const mockOnClose = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <PatientDetailModal
        isOpen={false}
        patientId="123"
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('should show loading skeleton initially when opened', () => {
    mockedApiFetch.mockResolvedValue({ ok: true, json: () => new Promise(() => {}) }); // Keep it pending
    render(
      <PatientDetailModal
        isOpen={true}
        patientId="123"
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('should fetch and display patient details successfully', async () => {
    mockedApiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockPatient) });
    render(
      <PatientDetailModal
        isOpen={true}
        patientId="123"
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

        await waitFor(() => {
      expect(screen.getByRole('heading', { name: /John Doe/i })).toBeInTheDocument();
    });

    // Check for specific details
    expect(screen.getByText((content, element) => element.tagName.toLowerCase() === 'p' && element.textContent === 'Name: John Doe')).toBeInTheDocument();
    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should display an error message if the API call fails', async () => {
    mockedApiFetch.mockRejectedValue(new Error('API Error'));
    render(
      <PatientDetailModal
        isOpen={true}
        patientId="123"
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText('Failed to fetch patient details.')).toBeInTheDocument();
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
  });

  it('should call onEdit with the patientId when the edit button is clicked', async () => {
    mockedApiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockPatient) });
    render(
      <PatientDetailModal
        isOpen={true}
        patientId="123"
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith('123');
  });

  it('should call onDelete with the patientId when the delete button is clicked', async () => {
    mockedApiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockPatient) });
    render(
      <PatientDetailModal
        isOpen={true}
        patientId="123"
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).toHaveBeenCalledWith('123');
  });

  it('should call onClose when the close button is clicked', async () => {
    mockedApiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockPatient) });
    render(
      <PatientDetailModal
        isOpen={true}
        patientId="123"
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
