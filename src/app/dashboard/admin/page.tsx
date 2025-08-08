'use client';

import { useEffect, useState } from 'react';
import BaseDashboard from '@/components/dashboard/BaseDashboard';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiFetch } from '@/lib/apiFetch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Terminal, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminData {
  totalUsers: number;
  apiErrorRate: string;
  dbConnections: number;
  systemLogs: { id: number; level: 'info' | 'warn' | 'error'; message: string; timestamp: string }[];
}

const KPICard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="p-6 bg-white rounded-lg shadow-md text-center">
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      if (user.role !== 'admin') {
        setError('Access Denied: You do not have permission to view this page.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiFetch('/api/dashboard/admin');
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard title="Total Users" value={data.totalUsers} />
            <KPICard title="API Error Rate" value={`${data.apiErrorRate}%`} />
            <KPICard title="DB Connections" value={data.dbConnections} />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">System Logs</h3>
            <div className="bg-gray-900 text-white font-mono rounded-lg shadow-md p-4 space-y-2 text-sm overflow-x-auto">
              {data.systemLogs.map((log) => (
                <div key={log.id} className={`flex items-start ${log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-gray-300'}`}>
                  <span className="mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className="font-bold mr-2">[{log.level.toUpperCase()}]</span>
                  <p>{log.message}</p>
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
      title="Admin Dashboard"
      description="System administration, user management, and operational monitoring."
    >
      {renderContent()}
    </BaseDashboard>
  );
}

