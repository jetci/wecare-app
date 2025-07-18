// app/dashboard/admin/page.tsx
'use client';

import React, { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Role } from '@prisma/client';
import { UserFormModal } from '@/components/admin/UserFormModal';

// Component สำหรับแสดงสถานะ
const StatusBadge = ({ status }: { status: boolean }) => {
  return (
    <div className="flex items-center">
      <div className={`h-2.5 w-2.5 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
      {status ? 'Approved' : 'Not Approved'}
    </div>
  );
};

// Component หลักของหน้า Admin Dashboard
const AdminDashboardPage = () => {
  const [filters, setFilters] = useState<{ role?: Role; approved?: boolean }>({});
  const [page, setPage] = useState(1);
  const limit = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { users, meta, isLoading, isError, mutate } = useAdminUsers({
    ...filters,
    page,
    limit,
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === 'all' ? undefined : (name === 'approved' ? value === 'true' : value),
    }));
    setPage(1);
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">จัดการผู้ใช้งาน</h1>
          <p className="mt-2 text-sm text-gray-700">
            รายชื่อผู้ใช้งานทั้งหมดในระบบ คุณสามารถกรองข้อมูลและจัดการผู้ใช้ได้
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            เพิ่มผู้ใช้ใหม่
          </button>
        </div>
      </div>

      {/* ส่วนของ Filters */}
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
            กรองตามบทบาท
          </label>
          <select
            id="role"
            name="role"
            onChange={handleFilterChange}
            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="all">ทั้งหมด</option>
            {Object.values(Role).map(roleValue => (
              <option key={roleValue} value={roleValue}>{roleValue}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="approved" className="block text-sm font-medium leading-6 text-gray-900">
            กรองตามสถานะการอนุมัติ
          </label>
          <select
            id="approved"
            name="approved"
            onChange={handleFilterChange}
            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="all">ทั้งหมด</option>
            <option value="true">Approved</option>
            <option value="false">Not Approved</option>
          </select>
        </div>
      </div>

      {/* ส่วนของตารางข้อมูล */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {isLoading ? (
              <p>กำลังโหลดข้อมูล...</p>
            ) : isError ? (
              <p className="text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">ชื่อ-นามสกุล</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">บทบาท (Role)</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">สถานะ</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Edit</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                        <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-gray-500">{user.nationalId}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{user.role}</td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500"><StatusBadge status={user.approved} /></td>
                      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">แก้ไข</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* ส่วนของ Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Previous</button>
                  <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Next</button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div><p className="text-sm text-gray-700">Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, meta.total)}</span> of <span className="font-medium">{meta.total}</span> results</p></div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">Previous</button>
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">Page {page} of {meta.totalPages}</span>
                      <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">Next</button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render Modal Component */}
      <UserFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserAdded={() => mutate()}
      />
    </div>
  );
};

export default AdminDashboardPage;
