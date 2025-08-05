'use client';

import { useState, useEffect, type ReactNode } from 'react';

export const ClientOnly = ({ children }: { children: ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // This log helps confirm the component has mounted on the client.
    console.log("✅ auth/ClientOnly mounted");
    setHasMounted(true);
  }, []);

  // Returning null on the server and initial client render prevents hydration mismatch.
  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};
