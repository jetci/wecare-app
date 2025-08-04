"use client";
import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import HealthChart from '@/components/dashboard/HealthChart';
import type { HealthPoint, SystemHealth } from '@/types/dashboard';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export default function SystemHealthPage() {
  const sampleHealth: SystemHealth = { cpuUsage: 0, memoryUsage: 0, dbConnections: 0 };
  const { data: health, error: healthError, isLoading: healthLoading } = useSWR<SystemHealth>('/api/health', fetcher);
  const healthData = health ?? sampleHealth;
  const sampleHistory: HealthPoint[] = [];
  const { data: history, error: historyError, isLoading: historyLoading } = useSWR<HealthPoint[]>('/api/health/history', fetcher);
  const historyData = history ?? sampleHistory;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">สถานะระบบ (System Health)</h1>
      <Card>
        {historyLoading ? (
          <Spinner />
        ) : historyError ? (
          <p>Error loading history</p>
        ) : (
          <HealthChart data={historyData} />
        )}
      </Card>
      <Card>
        {healthLoading ? (
          <Spinner />
        ) : healthError ? (
          <p>Error loading health</p>
        ) : (
          <ul>
            <li>CPU Usage: {healthData.cpuUsage}%</li>
            <li>Memory Usage: {healthData.memoryUsage}%</li>
            <li>DB Connections: {healthData.dbConnections}</li>
          </ul>
        )}
      </Card>
    </div>
  );
}
