'use client';

import { useEffect, useState } from 'react';
import BaseDashboard from '@/components/dashboard/BaseDashboard';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiFetch } from '@/lib/apiFetch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Terminal, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ExecutiveData {
  totalRequests: number;
  totalPatientsServed: number;
  systemUptime: string;
  overallSatisfaction: string;
  regionalPerformance: { id: number; region: string; value: number; trend: 'up' | 'down' | 'stable' }[];
}

const KPICard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="p-6 bg-white rounded-lg shadow-md text-center">
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Skeleton className="h-32 rounded-lg" />
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

export default function ExecutiveDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      if (user.role !== 'executive') {
        setError('Access Denied: You do not have permission to view this dashboard.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiFetch('/api/dashboard/executive');
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
  }, [user]);

  const renderContent = () => {
    if (loading) return <LoadingSkeleton />;
    if (error) {
      const isAccessError = error.includes('Access Denied');
      return (
        <Alert variant={isAccessError ? 'default' : 'destructive'} className={isAccessError ? 'bg-yellow-100 border-yellow-500 text-yellow-800' : ''}>
          {isAccessError ? <ShieldAlert className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
          <AlertTitle>{isAccessError ? 'Access Denied' : 'Error'}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    if (data) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard title="Total Requests" value={data.totalRequests} />
            <KPICard title="Patients Served" value={data.totalPatientsServed} />
            <KPICard title="System Uptime" value={`${data.systemUptime}%`} />
            <KPICard title="Satisfaction" value={`${data.overallSatisfaction}%`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Regional Performance</h3>
            <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
              {data.regionalPerformance.map((item) => (
                <div key={item.id} className="border-b pb-2 mb-2 flex justify-between items-center">
                  <p className="font-bold">{item.region}</p>
                  <p className={`font-semibold ${item.trend === 'up' ? 'text-green-600' : item.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                    {item.value} ({item.trend})
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <BaseDashboard
      title="Executive Dashboard"
      description="ภาพรวมข้อมูลสรุปเชิงกลยุทธ์สำหรับผู้บริหาร"
    >
      {renderContent()}
    </BaseDashboard>
  );
}