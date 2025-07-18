'use client';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// รายชื่อหน้าที่ไม่ให้เข้าถึงหากล็อกอินแล้ว
const publicRoutes = ['/login', '/register'];

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-gray-100">
    <p>Loading...</p>
  </div>
);

export const Auth = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const isPublicRoute = publicRoutes.includes(pathname);
    // Prevent authenticated users from accessing public routes
    if (isPublicRoute && isAuthenticated) {
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      router.push(callbackUrl);
    }
  }, [loading, isAuthenticated, pathname, searchParams, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};
