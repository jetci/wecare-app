'use client';

import type { Patient } from '@/types/entities';
import Modal from '@/components/ui/Modal';
import PatientDetailModal from '@/components/dashboard/community/PatientDetailModal';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BaseDashboard from '@/components/dashboard/BaseDashboard';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiFetch } from '@/lib/apiFetch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Terminal } from 'lucide-react';
import PatientTable from '@/components/dashboard/community/PatientTable';

// Data structure for the API response
interface CommunityData {
  activeRequests: number;
  totalPatients: number;
  volunteersOnline: number;
}

// Reusable KPI Card component
const KPICard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

// Placeholder for Recent Updates section
const RecentUpdates = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">Recent Updates</h2>
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[200px] flex items-center justify-center">
      <p className="text-gray-400">Recent updates will be displayed here.</p>
    </div>
  </div>
);

// A more focused loading skeleton for the initial page structure
const LoadingSkeleton = () => (
  <div className="space-y-8">
    {/* KPI Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
    {/* Patient Table Skeleton */}
    <div>
      <Skeleton className="h-10 w-1/3 mb-4 rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
    {/* Recent Updates Skeleton */}
    <div>
      <Skeleton className="h-10 w-1/4 mb-4 rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  </div>
);

export default function CommunityDashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const [data, setData] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handleRowClick = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPatientId(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error on new fetch
        const response = await apiFetch('/api/dashboard/community');
        if (!response.ok) {
          if (response.status === 401) {
            auth.logout();
            setError('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
            router.push('/login');
            return; // Stop further execution
          }
          const errorData = await response.json().catch(() => null); // Try to get more info
          throw new Error(`HTTP error! Status: ${response.status} - ${errorData?.message || 'No error message'}`);
        }
        const result = await response.json();
        setData(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (auth.initialChecked) {
      fetchData();
    }
  }, [auth.initialChecked]);

  const renderContent = () => {
    if (loading) {
      return <LoadingSkeleton />;
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (data) {
      return (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <KPICard title="Active Requests" value={data.activeRequests} />
            <KPICard title="Total Patients" value={data.totalPatients} />
            <KPICard title="Volunteers Online" value={data.volunteersOnline} />
          </div>

          {/* Patient Table Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Patient Overview</h2>
            <PatientTable onRowClick={handleRowClick} />
          </div>

          {/* Recent Updates Section */}
          <RecentUpdates />
        </div>
      );
    }

    return null; // Should not happen if logic is correct
  };

  return (
    <BaseDashboard
      title="Community Dashboard"
      description="Initial overview of community health metrics and patient data."
    >
      {renderContent()}
      {isDetailModalOpen && selectedPatientId && (
        <Modal open={isDetailModalOpen} onClose={handleCloseModal} title="Patient Details">
          <PatientDetailModal
            patientId={selectedPatientId}
            isOpen={isDetailModalOpen}
            onClose={handleCloseModal}
            onEdit={() => console.log('Edit clicked')}
            onDelete={() => console.log('Delete clicked')}
          />
        </Modal>
      )}
    </BaseDashboard>
  );
}
