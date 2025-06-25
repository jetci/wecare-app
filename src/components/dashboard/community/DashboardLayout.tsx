"use client";
import React, { ReactNode } from 'react';

interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
}

export default function DashboardLayout({ title, children }: DashboardLayoutProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {children}
      </div>
    </div>
  );
}
