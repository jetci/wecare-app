import React, { useState } from 'react';
import { useAdminUserManagement } from '@/hooks/useAdminUserManagement';
import Pagination from '@/components/common/Pagination';
import EditUserRoleModal from './EditUserRoleModal';
import { User, Role, Position } from '@prisma/client';
import toast from 'react-hot-toast';

const UserTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data, isLoading, isError, approveUser, updateUserRole } = useAdminUserManagement(
    page,
    limit,
    search
  );

  const handleApprove = async (userId: string) => {
    const promise = approveUser(userId);
    toast.promise(promise, {
      loading: 'Approving user...',
      success: 'User approved successfully!',
      error: 'Failed to approve user.',
    });
  };

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setModalOpen(false);
  };

  const handleSaveRole = async (userId: string, role?: Role, position?: Position) => {
    const promise = updateUserRole(userId, role, position);
    toast.promise(promise, {
      loading: 'Updating user role...',
      success: 'User role updated successfully!',
      error: 'Failed to update user role.',
    });
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4 text-red-500">Failed to load users.</div>;

  const users = data?.users || [];
  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or national ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-md w-full sm:w-1/3"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">National ID</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Phone</th>
              <th className="py-2 px-4 text-left">Position</th>
              <th className="py-2 px-4 text-left">Role</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{`${user.firstName} ${user.lastName}`}</td>
                <td className="py-2 px-4">{user.nationalId}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">{user.phone || '-'}</td>
                <td className="py-2 px-4">{user.position || '-'}</td>
                <td className="py-2 px-4">{user.role}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.approved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {user.approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="py-2 px-4">
                  {!user.approved && (
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="ml-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
        <EditUserRoleModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveRole}
        />
      </div>
    </div>
  );
};

export default UserTable;

