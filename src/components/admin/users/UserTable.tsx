'use client';

import React from 'react';
import { UserData } from '@/hooks/useUsers';

interface UserTableProps {
  users: UserData[];
  isLoading: boolean;
  isError: any;
}

const UserTable: React.FC<UserTableProps> = ({ users, isLoading, isError }) => {
  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Failed to load users.</div>;
  if (!users || users.length === 0) return <div>No users found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="w-full bg-gray-100 text-left">
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">National ID</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Position</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{`${user.firstName || ''} ${user.lastName || ''}`}</td>
              <td className="py-2 px-4 border-b">{user.nationalId}</td>
              <td className="py-2 px-4 border-b">{user.role}</td>
              <td className="py-2 px-4 border-b">{user.position || 'N/A'}</td>
              <td className="py-2 px-4 border-b">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isApproved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {user.isApproved ? 'Approved' : 'Pending'}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                <button className="text-blue-500 hover:underline">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
