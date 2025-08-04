'use client';

import React from 'react';
import useSWR from 'swr';
import authFetcher from '@/lib/authFetcher';
import Link from 'next/link';

export default function UserProfilePage() {
  const { data, error } = useSWR('/api/auth/profile', authFetcher);
  if (error) return <div className="p-6 text-red-500">Error loading profile</div>;
  if (!data) return <div className="p-6">Loading...</div>;

  const { user } = data;
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <div className="flex items-center space-x-6">
        <img
          src={user.avatarUrl || '/default-avatar.png'}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-semibold">
            {user.prefix} {user.firstName} {user.lastName}
          </h2>
          <p className="text-gray-600">Role: {user.role}</p>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <p><span className="font-medium">National ID:</span> {user.nationalId}</p>
        <p><span className="font-medium">Phone:</span> {user.phone || '-'}</p>
        <p><span className="font-medium">Address:</span> {user.address.houseNumber}, {user.address.village}, {user.address.subdistrict}, {user.address.district}, {user.address.province}</p>
      </div>
      <div className="mt-6">
        <Link href="/dashboard/profile/edit">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
            แก้ไขข้อมูลส่วนตัว
          </button>
        </Link>
      </div>
    </div>
  );
}
