'use client';

import React from 'react';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { Terminal, Edit, Trash2 } from 'lucide-react';

interface PatientDetails {
  id: string;
  name: string;
  age: number;
  condition: string;
  status: string;
  lastCheckIn: string;
}

interface PatientDetailModalProps {
  patientId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (patientId: string) => void;
  onDelete: (patientId: string) => void;
}

const DetailSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-1/3" />
  </div>
);

const PatientDetailModal = ({ patientId, isOpen, onClose, onEdit, onDelete }: PatientDetailModalProps) => {
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId && isOpen) {
      const fetchPatientDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await apiFetch(`/api/patients/${patientId}`);
          if (!response.ok) throw new Error('Failed to fetch');
          const data = await response.json();
          setPatient(data);
        } catch (err) {
          setError('Failed to fetch patient details.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchPatientDetails();
    }
  }, [patientId, isOpen]);

  const handleClose = () => {
    setPatient(null);
    setError(null);
    onClose();
  }

  return (
    <Modal open={isOpen} onClose={handleClose} title={patient?.name || 'Loading...'}>
      <div className="mt-4">
        {loading && <DetailSkeleton />}
        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {patient && !loading && !error && (
          <div className="space-y-2">
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Condition:</strong> {patient.condition}</p>
            <p><strong>Status:</strong> {patient.status}</p>
            <p><strong>Last Check-in:</strong> {new Date(patient.lastCheckIn).toLocaleString()}</p>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleClose}>Close</Button>
              <Button onClick={() => onEdit(patient.id)}><Edit className="mr-2 h-4 w-4"/> Edit</Button>
              <Button variant="danger" onClick={() => onDelete(patient.id)}><Trash2 className="mr-2 h-4 w-4"/> Delete</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PatientDetailModal;
