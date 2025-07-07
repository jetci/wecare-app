"use client";
import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

interface FeatureFlag { key: string; name: string; enabled: boolean; }

export default function FeatureFlagsPage() {
  const sampleFlags: FeatureFlag[] = [
    { key: 'flag1', name: 'NewUI', enabled: true },
    { key: 'flag2', name: 'BetaMode', enabled: false },
  ];
  const { data, error, isLoading } = useSWR<FeatureFlag[]>('/api/feature-flags', fetcher);
  const flagsData = data ?? sampleFlags;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Feature Flags</h1>
      <Card>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <p>Error loading feature flags</p>
        ) : (
          <ul className="space-y-2">
            {flagsData.map((f: any) => (
              <li key={f.key} className="flex justify-between">
                <span>{f.name}</span>
                <span>{f.enabled ? 'On' : 'Off'}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
