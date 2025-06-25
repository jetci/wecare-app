"use client";

import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export default function CachePage() {
  const { data, error, isLoading } = useSWR('/api/cache/status', fetcher);
  const sampleCache = { hits: 0, misses: 0, keysCount: 0 };
  const cacheData = data || sampleCache;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Cache Status</h1>
      <Card>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <p>Error loading cache status</p>
        ) : (
          <ul className="space-y-2">
            <li>Hits: {cacheData.hits}</li>
            <li>Misses: {cacheData.misses}</li>
            <li>Keys Count: {cacheData.keysCount}</li>
          </ul>
        )}
      </Card>
    </div>
  );
}
