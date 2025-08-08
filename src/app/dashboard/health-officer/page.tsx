'use client';

import { useEffect, useState } from 'react';
import BaseDashboard from '@/components/dashboard/BaseDashboard';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiFetch } from '@/lib/apiFetch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Terminal } from 'lucide-react';

interface HealthOfficerData {
  activeCases: number;
  pendingReviews: number;
  avgCaseResolutionTime: string;
  patientAlerts: { id: number; patientName: string; alert: string; timestamp: string }[];
}

const KPICard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/4 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

export default function HealthOfficerDashboardPage() {
  const [data, setData] = useState<HealthOfficerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiFetch('/api/dashboard/health-officer');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <BaseDashboard
      title="Health Officer Dashboard"
      description="ภาพรวมสำหรับเจ้าหน้าที่สาธารณสุขในการจัดการเคสและข้อมูลผู้ป่วย"
    >
      {loading && <LoadingSkeleton />}
      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load health officer dashboard data: {error}</AlertDescription>
        </Alert>
      )}
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <KPICard title="Active Cases" value={data.activeCases} />
            <KPICard title="Pending Reviews" value={data.pendingReviews} />
            <KPICard title="Avg. Resolution Time" value={data.avgCaseResolutionTime} />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">High Priority Patient Alerts</h3>
            <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
              {data.patientAlerts.map((alert) => (
                <div key={alert.id} className="border-b pb-2 mb-2">
                  <p className="font-bold">{alert.patientName}</p>
                  <p>{alert.alert}</p>
                  <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </BaseDashboard>
  );
}
