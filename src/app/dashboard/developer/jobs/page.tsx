"use client";

import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export default function JobsPage() {
  const { data, error, isLoading } = useSWR('/api/jobs/status', fetcher);
  const sampleJobs = {
    successCount: 0,
    failedCount: 0,
    items: [],
  };
  const jobsData = data || sampleJobs;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Background Jobs Status</h1>
      <Card>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <p>Error loading job statuses</p>
        ) : (
          <>
            <p>Success: {jobsData.successCount}</p>
            <p>Failed: {jobsData.failedCount}</p>
            <ul className="mt-2 space-y-1">
              {jobsData.items.map((job: any, i: number) => (
                <li key={i} className="flex justify-between">
                  <span>{job.name}</span>
                  <span>{job.status}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
