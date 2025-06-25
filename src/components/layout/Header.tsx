"use client";

import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Spinner } from '@/components/ui/Spinner';

// Define authenticated profile type
interface AuthProfile {
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

const fetcher = (url: string) => fetch(url, {
  headers: {
    Authorization: `Bearer ${document.cookie.split('; ').find(c => c.startsWith('accessToken='))?.split('=')[1]}`
  },
  credentials: 'include',
}).then(res => res.json());

const authFetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${document.cookie.split('; ').find(c => c.startsWith('accessToken='))?.split('=')[1]}`
    },
    credentials: 'include',
  });
  if (!res.ok) {
    // clear stale token
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    throw new Error('Unauthorized');
  }
  return res.json();
};

export default function Header() {
  const { data, error, isLoading } = useSWR<AuthProfile, Error>('/api/auth/profile', authFetcher, { revalidateOnMount: true });
  if (isLoading) {
    return (
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <div className="text-xl font-bold">WeCare</div>
        <Spinner />
      </header>
    );
  }
  const isAuth = Boolean(data?.user);
  let firstName = '', lastName = '', roleLabel = '';
  if (isAuth) {
    const { firstName: fn, lastName: ln, role } = data!.user;
    firstName = fn; lastName = ln;
    const roleLabels: Record<string, string> = {
      USER: 'ผู้ใช้ทั่วไป', ADMIN: 'ผู้ดูแลระบบ', DRIVER: 'คนขับ', HEALTH_OFFICER: 'เจ้าหน้าที่สาธารณสุข', EXECUTIVE: 'ผู้บริหาร'
    };
    roleLabel = roleLabels[role] || role;
  }

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="text-xl font-bold">WeCare</div>
      {isAuth && !error ? (
        <div className="text-sm text-right">
          👤 {firstName} {lastName}
          <br />
          🔰 บทบาท: {roleLabel}
        </div>
      ) : (
        <nav className="space-x-4">
          <Link href="/">หน้าแรก</Link>
          <Link href="/login">เข้าสู่ระบบ</Link>
          <Link href="/register">สมัครสมาชิก</Link>
        </nav>
      )}
    </header>
  );
}
