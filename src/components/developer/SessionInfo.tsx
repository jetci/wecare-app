'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SessionInfo = () => {
  const { user, accessToken, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-4 bg-gray-100 rounded-lg animate-pulse"><div className="h-8 bg-gray-300 rounded w-1/2"></div></div>;
  }

  const renderValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      return <pre className="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1 overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>;
    }
    if (typeof value === 'string' && value.length > 50) {
        return <textarea readOnly className="w-full h-24 p-2 mt-1 text-xs border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">{value}</textarea>;
    }
    return <span className="text-indigo-600 dark:text-indigo-400 font-mono">{String(value)}</span>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Session Information</h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-300">User Profile:</p>
          {renderValue(user)}
        </div>
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-300">Access Token:</p>
          {renderValue(accessToken)}
        </div>
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-300">Role:</p>
          {renderValue(user?.role)}
        </div>
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-300">Approved Status:</p>
          {renderValue(user?.isApproved)}
        </div>
      </div>
    </div>
  );
};

export default SessionInfo;
