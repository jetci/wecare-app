import React from 'react';

interface BaseDashboardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const BaseDashboard: React.FC<BaseDashboardProps> = ({ title, description, children }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">{description}</p>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default BaseDashboard;
