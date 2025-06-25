"use client";

import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export default function DeploymentsPage() {
  const { data, error, isLoading } = useSWR('/api/deployments/status', fetcher);
  const sample = { pendingCount: 0, successCount: 0, failureCount: 0, lastDeployed: '' };
  const stats = data || sample;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Deployment Status</h1>
      <Card>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <p>Error loading deployment status</p>
        ) : (
          <ul className="space-y-2">
            <li>Pending: {stats.pendingCount}</li>
            <li>Success: {stats.successCount}</li>
            <li>Failure: {stats.failureCount}</li>
            <li>Last Deployed: {stats.lastDeployed}</li>
          </ul>
        )}
      </Card>
    </div>
  );
}
