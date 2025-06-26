"use client";

import React, { ReactNode } from "react";
import dynamic from 'next/dynamic';
const ConditionalHeader = dynamic(() => import('@/components/layout/ConditionalHeader'), { ssr: false });
// Removed static import of ConditionalHeader; now dynamic import above
import HydrateSafe from '@/components/HydrateSafe';

const LoadScriptNext = dynamic(
  () => import('@react-google-maps/api').then((mod) => mod.LoadScriptNext),
  { ssr: false }
);

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <div suppressHydrationWarning>
    <HydrateSafe>    
      <LoadScriptNext googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>

          <div>
          <ConditionalHeader />
          {children}
        </div>

      </LoadScriptNext>
    </HydrateSafe>
    </div>
  );
}

