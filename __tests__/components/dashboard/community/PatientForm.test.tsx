import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { PatientForm } from '@/components/dashboard/community/PatientForm';
import { apiFetch } from '@/lib/apiFetch';

// Mock the apiFetch function and schema
vi.mock('@/lib/apiFetch');
vi.mock('@/schemas/patient.schema', () => {
  const z = require('zod');
  return {
    patientFormSchema: z.object({
      name: z.string().min(1, 'Name is required'),
      age: z.coerce.number().min(1, 'Age must be positive'),
      gender: z.enum(['Male', 'Female', 'Other']),
      condition: z.string().min(1, 'Condition is required'),
      address: z.string().optional(),
      phoneNumber: z.string().optional(),
    })
  };
});

const mockApiFetch = apiFetch as Mock;

describe('PatientForm', () => {
  const onSuccessMock = vi.fn();
  const onCancelMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPatientData = {
    id: '123',
    name: 'John Doe',
    age: 45,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    condition: 'Stable',
    address: '123 Main St',
    phoneNumber: '555-1234',
  };

  it('should render the form in create mode', () => {
    render(<PatientForm onSuccess={onSuccessMock} onCancel={onCancelMock} />);

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Patient/i })).toBeInTheDocument();
  });

  it('should render the form in edit mode with initial data', () => {
    render(<PatientForm initialData={mockPatientData} onSuccess={onSuccessMock} onCancel={onCancelMock} />);

    expect(screen.getByLabelText(/Name/i)).toHaveValue(mockPatientData.name);
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });

  it('should show validation errors for required fields', async () => {
    render(<PatientForm onSuccess={onSuccessMock} onCancel={onCancelMock} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Create Patient/i }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Condition is required')).toBeInTheDocument();
    });
  });

  it('should submit new patient data correctly', async () => {
    mockApiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    render(<PatientForm onSuccess={onSuccessMock} onCancel={onCancelMock} />);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/Condition/i), { target: { value: 'Good' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Patient/i }));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/api/patients', expect.anything());
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });

  it('should submit updated patient data correctly', async () => {
    mockApiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    render(<PatientForm initialData={mockPatientData} onSuccess={onSuccessMock} onCancel={onCancelMock} />);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Johnathan Doe' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(`/api/patients/${mockPatientData.id}`, expect.anything());
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });

  it('should display an error message on submission failure', async () => {
    const errorMessage = 'Failed to save patient';
    mockApiFetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({ message: errorMessage }) });
    render(<PatientForm onSuccess={onSuccessMock} onCancel={onCancelMock} />);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Condition/i), { target: { value: 'Critical' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Patient/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should call onCancel when the cancel button is clicked', () => {
    render(<PatientForm onSuccess={onSuccessMock} onCancel={onCancelMock} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onCancelMock).toHaveBeenCalled();
  });
});
