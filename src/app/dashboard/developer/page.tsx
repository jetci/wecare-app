'use client';

import { useEffect, useState } from 'react';
import BaseDashboard from '@/components/dashboard/BaseDashboard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiFetch';
import ClientOnly from '@/components/common/ClientOnly';

// Data structure from our mock API
interface ApiStatus {
  name: string;
  status: 'OK' | 'Degraded' | 'Failed';
  responseTime: string;
}

interface DbMetric {
  metric: string;
  value: string;
}

interface Deployment {
  id: string;
  status: 'Success' | 'Failed';
  timestamp: string;
}

interface SystemLog {
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
}

interface UserActivity {
  user: string;
  action: string;
  count: number;
}

interface DeveloperDashboardData {
  apiStatus: { title: string; data: ApiStatus[] };
  databaseMetrics: { title: string; data: DbMetric[] };
  recentDeployments: { title: string; data: Deployment[] };
  systemLogs: { title: string; data: SystemLog[] };
  userActivity: { title: string; data: UserActivity[] };
}

const DashboardSkeleton = () => (
  <BaseDashboard
    title="Developer Dashboard"
    description="กำลังตรวจสอบสิทธิ์และโหลดข้อมูล..."
  >
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  </BaseDashboard>
);

// Helper component for displaying data in a card
const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">{title}</h3>
    <div className="p-4 space-y-2">{children}</div>
  </div>
);

function DeveloperDashboard() {
  console.log("[DevDash] Component mounted."); // SA Request: Check mount
  const { initialChecked, isAuthenticated } = useAuth();
  const [data, setData] = useState<DeveloperDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    console.log(`[DevDash] useEffect triggered. initialChecked: ${initialChecked}, isAuthenticated: ${isAuthenticated}`); // SA Request: Check useEffect trigger and states

    if (!initialChecked) {
      console.log("[DevDash] useEffect skipped: initial auth check not complete.");
      return; // Wait for auth check
    }
    if (!isAuthenticated) {
      console.log("[DevDash] useEffect skipped: user not authenticated.");
      setIsFetching(false);
      return; // Don't fetch if not logged in
    }

    const fetchData = async () => {
      console.log("[DevDash] Attempting to fetch..."); // SA Request: Log fetch attempt
      setIsFetching(true);
      setError(null);
      try {
        const response = await apiFetch('/api/dashboard/developer');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const result = await response.json();
        console.log('[DevDash] API response:', result); // SA Request: Log response
        setData(result);
      } catch (e: any) {
        console.error('[DevDash] Fetch error:', e);
        setError(e.message || 'An unknown error occurred.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [initialChecked, isAuthenticated]);

  if (isFetching) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <BaseDashboard title="Developer Dashboard" description="เกิดข้อผิดพลาด">
        <div className="text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="font-bold">ไม่สามารถโหลดข้อมูล Dashboard ได้</p>
          <pre className="mt-2 text-sm whitespace-pre-wrap">{error}</pre>
        </div>
      </BaseDashboard>
    );
  }

  if (!data) {
    return (
      <BaseDashboard title="Developer Dashboard" description="ไม่มีข้อมูล">
        <p>ไม่พบข้อมูลสำหรับ Developer Dashboard หรือผู้ใช้ไม่มีสิทธิ์</p>
      </BaseDashboard>
    );
  }

  console.log('[DevDash] Render data groups', data); // SA Request: Log render data

  return (
    <BaseDashboard
      title="Developer Dashboard"
      description="ภาพรวมสถานะระบบ, การ deploy, และกิจกรรมล่าสุด"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InfoCard title={data.apiStatus.title}>
            {data.apiStatus.data.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="font-mono text-gray-600 dark:text-gray-300">{item.name}</span>
                <span className={`font-semibold ${item.status === 'OK' ? 'text-green-500' : 'text-yellow-500'}`}>{item.status}</span>
              </div>
            ))}
          </InfoCard>
          <InfoCard title={data.databaseMetrics.title}>
             {data.databaseMetrics.data.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">{item.metric}</span>
                <span className="font-mono font-semibold text-gray-800 dark:text-gray-100">{item.value}</span>
              </div>
            ))}
          </InfoCard>
        </div>

        <InfoCard title={data.recentDeployments.title}>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 -mt-2">
            {data.recentDeployments.data.map(d => (
              <li key={d.id} className="py-2 flex justify-between items-center text-sm">
                <div>
                  <span className="font-mono text-blue-500">{d.id}</span>
                  <span className={`ml-4 font-semibold ${d.status === 'Success' ? 'text-green-600' : 'text-red-600'}`}>{d.status}</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">{new Date(d.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </InfoCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <InfoCard title={data.systemLogs.title}>
             {data.systemLogs.data.map((log, i) => (
                <div key={i} className="text-xs font-mono">
                  <span className={`${log.level === 'ERROR' ? 'text-red-500' : log.level === 'WARN' ? 'text-yellow-500' : 'text-gray-400'}`}>{log.level}</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">{log.message}</span>
                </div>
              ))}
          </InfoCard>
          <InfoCard title={data.userActivity.title}>
            {data.userActivity.data.map((act, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">{act.action}</span>
                <span className="font-bold text-gray-800 dark:text-gray-100">{act.count}</span>
              </div>
            ))}
          </InfoCard>
        </div>

      </div>
    </BaseDashboard>
  );
}

export default function DeveloperDashboardPage() {
  return (
    <ClientOnly>
      <DeveloperDashboard />
    </ClientOnly>
  );
}
