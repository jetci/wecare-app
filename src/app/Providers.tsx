"use client";

import React, { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { LoadScriptNext } from '@react-google-maps/api';
import { AuthProvider } from '@/context/AuthContext';

// Providers now expects a single ReactElement child (e.g., a fragment)
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LoadScriptNext
        id="gmap-script"
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        language="th"
        region="TH"
      >
        <>
          {children}
          <Toaster position="top-right" />
        </>
      </LoadScriptNext>
    </AuthProvider>
  );
}
