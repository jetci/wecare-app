"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function NavigationTabs() {
  const pathname = usePathname();
  const tabs = [
    { name: 'Dashboard', href: '/dashboard/community', testId: 'tab-dashboard' },
    { name: 'History', href: '/dashboard/community/history', testId: 'tab-history' }
  ];

  return (
    <nav className="border-b mb-4">
      <ul className="flex space-x-4">
        {tabs.map(tab => {
          const isActive = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                  href={tab.href}
                  data-testid={tab.testId}
                  className={`pb-2 ${isActive ? 'border-b-2 text-blue-600' : 'text-gray-600'}`}
                >
                  {tab.name}
                </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
