'use client';

import React from 'react';
import UserTable from '@/components/admin/UserTable';

const UserManagementPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <UserTable />
    </div>
  );
};

export default UserManagementPage;
