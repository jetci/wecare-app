'use client';

import React from 'react';
import RoleGuard from '@/components/RoleGuard';
import { Role } from '@/types/roles';
import DashboardLinkCard from '@/components/developer/DashboardLinkCard';
import SessionInfo from '@/components/developer/SessionInfo';
import ApiTestTool from '@/components/developer/ApiTestTool';
import {
  UsersIcon,
  UserGroupIcon,
  HeartIcon,
  BuildingOffice2Icon,
  WrenchScrewdriverIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const dashboardLinks = [
  {
    href: '/dashboard/admin/users',
    title: 'Admin',
    description: 'Manage users, roles, and system settings.',
    icon: WrenchScrewdriverIcon,
  },
  {
    href: '/dashboard/community',
    title: 'Community',
    description: 'View and manage community user requests.',
    icon: UserGroupIcon,
  },
  {
    href: '/dashboard/driver',
    title: 'Driver',
    description: 'Access driver-specific tools and information.',
    icon: UserCircleIcon, // Using a generic user icon for Driver
  },
  {
    href: '/dashboard/health-officer',
    title: 'Health Officer',
    description: 'Oversee patient care and health services.',
    icon: HeartIcon,
  },
  {
    href: '/dashboard/executive',
    title: 'Executive',
    description: 'Review analytics and high-level reports.',
    icon: BuildingOffice2Icon,
  },
];

export default function DeveloperDashboardPage() {
  return (
    <RoleGuard allowedRoles={[Role.DEVELOPER]}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Developer Dashboard</h1>
          <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">Tools and resources for development and testing.</p>
        </header>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Dashboard Shortcuts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardLinks.map((link) => (
              <DashboardLinkCard key={link.title} {...link} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Developer Tools</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SessionInfo />
            <ApiTestTool />
          </div>
        </section>

        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 pt-8">
          <p>WeCare Platform v1.0.0 - Developer Environment</p>
        </footer>
      </div>
    </RoleGuard>
  );
}

