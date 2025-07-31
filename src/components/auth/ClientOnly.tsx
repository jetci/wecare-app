'use client';

import { useState, useEffect, type ReactNode } from 'react';

const InitialLoadingScreen = () => (
  <div suppressHydrationWarning className="flex h-screen items-center justify-center bg-white">
    <p>Loading Application...</p>
  </div>
);

export const ClientOnly = ({ children }: { children: ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};
