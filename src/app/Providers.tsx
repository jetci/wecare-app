"use client";

import React, { ReactNode } from 'react';
import { LoadScriptNext } from '@react-google-maps/api';

// Providers now expects a single ReactElement child (e.g., a fragment)
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LoadScriptNext
      id="gmap-script"
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      language="th"
      region="TH"
    >
      <>
        {children}
      </>
    </LoadScriptNext>
  );
}
