'use client';

import React from 'react';
import { useUsers } from '@/hooks/useUsers';
import UserTable from '@/components/admin/users/UserTable';

const AdminUsersPage = () => {
  const { users, isLoading, isError } = useUsers();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        {/* TODO: Add 'Create User' button */}
      </div>
      <UserTable users={users || []} isLoading={isLoading} isError={isError} />
    </div>
  );
};

export default AdminUsersPage;
