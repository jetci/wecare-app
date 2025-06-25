"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Dynamically load Header on client side only
const Header = dynamic(() => import('./Header'), { ssr: false });

export default function ConditionalHeader() {
  const pathname = usePathname();
  // ซ่อน Header เฉพาะบนเส้นทาง /dashboard
  if (pathname.startsWith('/dashboard')) return null;
  // Always show Header for non-dashboard routes
  return <Header />;
}
