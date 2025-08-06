'use client';

import AppShell from '@/components/layout/AppShell';
import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <AppShell>
      <section>
        <Toaster position="bottom-right" />
        {children}
      </section>
    </AppShell>
  );
}
