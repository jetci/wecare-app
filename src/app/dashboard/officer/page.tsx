'use client';
import React from 'react';
import { useOfficerPatients } from '@/hooks/useOfficerPatients';
import { useOfficerAppointments } from '@/hooks/useOfficerAppointments';
import styles from './page.module.css';

export default function OfficerDashboard() {
  const { data: patients, error: patientsError, isLoading: patientsLoading } = useOfficerPatients();
  const { data: appointments, error: appointmentsError, isLoading: appointmentsLoading } = useOfficerAppointments();
  const isLoading = patientsLoading || appointmentsLoading;

  if (isLoading) {
    return <div data-testid="loading">Loading…</div>;
  }
  if (patientsError || appointmentsError) {
    return (
      <div className={styles.error} data-testid="error">
        Error loading data
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Officer Dashboard</h1>
      <div className={styles.stats}>
        <div>Patients: {patients?.length}</div>
        <div>Appointments: {appointments?.length}</div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr><th>ID</th><th>Area</th><th>Status</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {appointments?.map(app => (
            <tr key={app.id}>
              <td>{app.id}</td>
              <td>{app.area}</td>
              <td>{app.status}</td>
              <td>{new Date(app.date).toLocaleString()}</td>
              <td>
                <button data-testid="approve-btn" onClick={() => fetch(`/api/officer/appointments/${app.id}/approve`, { method: 'POST' }).then(() => window.location.reload())}>
                  Approve
                </button>
                <button data-testid="deny-btn" onClick={() => fetch(`/api/officer/appointments/${app.id}/deny`, { method: 'POST' }).then(() => window.location.reload())}>
                  Deny
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
