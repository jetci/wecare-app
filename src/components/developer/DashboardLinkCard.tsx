'use client';

import Link from 'next/link';
import React from 'react';

interface DashboardLinkCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const DashboardLinkCard: React.FC<DashboardLinkCardProps> = ({ href, title, description, icon: Icon }) => {
  return (
    <Link href={href} legacyBehavior>
      <a className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
        <div className="flex items-center mb-3">
          <Icon className="w-8 h-8 text-indigo-500 mr-4" />
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h5>
        </div>
        <p className="font-normal text-gray-700 dark:text-gray-400">{description}</p>
      </a>
    </Link>
  );
};

export default DashboardLinkCard;
