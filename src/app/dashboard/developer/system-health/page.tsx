"use client";
import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import HealthChart from '@/components/dashboard/HealthChart';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export default function SystemHealthPage() {
  const { data: health, error: healthError, isLoading: healthLoading } = useSWR('/api/health', fetcher);
  const { data: history, error: historyError, isLoading: historyLoading } = useSWR('/api/health/history', fetcher);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">สถานะระบบ (System Health)</h1>
      <Card>
        {historyLoading ? (
          <Spinner />
        ) : historyError ? (
          <p>Error loading history</p>
        ) : (
          <HealthChart data={history} />
        )}
      </Card>
      <Card>
        {healthLoading ? (
          <Spinner />
        ) : healthError ? (
          <p>Error loading health</p>
        ) : (
          <ul>
            <li>CPU Usage: {health.cpuUsage}%</li>
            <li>Memory Usage: {health.memoryUsage}%</li>
            <li>DB Connections: {health.dbConnections}</li>
          </ul>
        )}
      </Card>
    </div>
  );
}
