"use client";

import React, { useEffect } from "react";
import useSWR from "swr";
import { fetcher } from '@/lib/fetcher';
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import HealthChart from '@/components/dashboard/HealthChart';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Role } from '@/types/roles';
import RoleGuard from '@/components/RoleGuard';


// Types for Developer Dashboard data

type HealthSummary = { cpuUsage: number; memoryUsage: number; dbConnections: number }; // summary stats
type HealthPoint = { timestamp: string; cpuUsage: number; memoryUsage: number; dbConnections: number };


// removed HealthStats (now HealthSummary)
type ErrorLogItem = { timestamp: string; message: string };
type ErrorLogs = { total: number; items: ErrorLogItem[] };
type LogItem = { timestamp: string; level: string; message: string };
type ApiStats = { uptimePercent: number; avgLatency: number };
type FeatureFlagItem = { key: string; name: string; enabled: boolean };
type JobItem = { name: string; status: string };
type JobsStats = { successCount: number; failedCount: number; items: JobItem[] };

export default function DeveloperDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  // redirect unauthorized developer users
  useEffect(() => {
    if (user?.role === Role.DEVELOPER && user?.nationalId !== '3500200461028') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // don't render UI if unauthorized
  if (user?.role === Role.DEVELOPER && user?.nationalId !== '3500200461028') {
    return null;
  }

  const { data: health, error: healthError, isLoading: healthLoading } = useSWR<HealthSummary>('/api/health', fetcher);
  const { data: history, error: historyError, isLoading: historyLoading } = useSWR<HealthPoint[]>('/api/health/history', fetcher);
  const { data: errorLogs, error: errorLogsError, isLoading: errorLogsLoading } = useSWR<ErrorLogs>('/api/logs?level=error&limit=5', fetcher);
  const { data: recentLogs, error: recentLogsError, isLoading: recentLogsLoading } = useSWR<LogItem[]>('/api/logs?limit=5', fetcher);
  const { data: apiStats, error: apiStatsError, isLoading: apiStatsLoading } = useSWR<ApiStats>('/api/metrics/api', fetcher);
  const { data: flags, error: flagsError, isLoading: flagsLoading } = useSWR<FeatureFlagItem[]>('/api/feature-flags', fetcher);
  const { data: jobs, error: jobsError, isLoading: jobsLoading } = useSWR<JobsStats>('/api/jobs/status', fetcher);

  // Sample placeholder data
  const sampleHealth = { cpuUsage: 72, memoryUsage: 58, dbConnections: 12 };
  const sampleErrorLogs = { total: 2, items: [ { timestamp: '2025-05-16T12:45:00', message: 'Sample error A' }, { timestamp: '2025-05-16T12:50:00', message: 'Sample error B' } ] };
  const sampleRecentLogs = [ { timestamp: '2025-05-16T12:55:00', level: 'info', message: 'Sample log A' }, { timestamp: '2025-05-16T12:57:00', level: 'warn', message: 'Sample log B' } ];
  const sampleApiStats = { uptimePercent: 99.95, avgLatency: 110 };
  const sampleFlags = [ { key: 'flag1', name: 'NewUI', enabled: true }, { key: 'flag2', name: 'BetaMode', enabled: false } ];
  const sampleJobs = { successCount: 4, failedCount: 1, items: [ { name: 'SyncJob', status: 'success' }, { name: 'EmailJob', status: 'failed' } ] };

  const healthData = health || sampleHealth;
  const errorData = errorLogs || sampleErrorLogs;
  const logsData = recentLogs || sampleRecentLogs;
  const apiData = apiStats || sampleApiStats;
  const flagsData = flags || sampleFlags;
  const jobsData = jobs || sampleJobs;

  return (
    <RoleGuard allowedRoles={[Role.DEVELOPER]}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Developer Dashboard Home</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-system-health" title="System Health Overview">
            {historyLoading ? <Spinner data-testid="spinner" /> : historyError ? (
              <p>Error loading history</p>
            ) : (
              <>
                <HealthChart data={history || []} />
                <ul className="mt-2">
                  <li>CPU Usage: {healthData.cpuUsage}%</li>
                  <li>Memory Usage: {healthData.memoryUsage}%</li>
                  <li>DB Connections: {healthData.dbConnections}</li>
                </ul>
              </>
            )}
          </Card>
          <Card data-testid="card-error-summary" title="Error Summary (Last 24h)">
            {errorLogsLoading ? <Spinner data-testid="spinner" /> : errorLogsError ? (
              <p>Error loading error logs</p>
            ) : (
              <>
                <p>Total Errors: {errorData.total}</p>
                <ul className="mt-2 space-y-1">
                  {errorData.items.map((err: any, i: number) => (
                    <li key={i}>
                      <span className="font-mono text-sm">{err.timestamp}</span>: {err.message}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
          <Card data-testid="card-latest-logs" title="Latest Logs">
            {recentLogsLoading ? <Spinner data-testid="spinner" /> : recentLogsError ? (
              <p>Error loading recent logs</p>
            ) : (
              <ul className="space-y-1">
                {logsData.map((log: any, i: number) => (
                  <li key={i}>
                    <span className="font-mono text-sm">{log.timestamp}</span> [{log.level}] {log.message}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card data-testid="card-api-uptime" title="API Uptime & Latency">
            {apiStatsLoading ? <Spinner data-testid="spinner" /> : apiStatsError ? (
              <p>Error loading API stats</p>
            ) : (
              <ul>
                <li>Uptime (24h): {apiData.uptimePercent}%</li>
                <li>Avg Latency: {apiData.avgLatency} ms</li>
              </ul>
            )}
          </Card>
          <Card data-testid="card-feature-flags" title="Feature Flags Overview">
            {flagsLoading ? <Spinner data-testid="spinner" /> : flagsError ? (
              <p>Error loading feature flags</p>
            ) : (
              <ul className="space-y-1">
                {flagsData.map((f: any) => (
                  <li key={f.key}>{f.name}: {f.enabled ? 'On' : 'Off'}</li>
                ))}
              </ul>
            )}
          </Card>
          <Card data-testid="card-jobs-status" title="Background Jobs Status">
            {jobsLoading ? <Spinner data-testid="spinner" /> : jobsError ? (
              <p>Error loading jobs status</p>
            ) : (
              <>
                <p>Success: {jobsData.successCount}</p>
                <p>Failed: {jobsData.failedCount}</p>
                <ul className="mt-2 space-y-1">
                  {jobsData.items.map((job: any, i: number) => (
                    <li key={i}>{job.name}: {job.status}</li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
