'use client';
import { AuthProvider } from '@/context/AuthContext';

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
