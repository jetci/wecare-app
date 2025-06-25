import React from 'react';
import Link from 'next/link';

type User = {
  name: string;
  role: string;
};

type Props = {
  isAuthenticated: boolean;
  user: User;
  handleLogout: () => void;
};

export default function WeCareHeader({ isAuthenticated, user, handleLogout }: Props) {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="text-2xl font-bold">
        <Link href={isAuthenticated ? '/dashboard' : '/'}>
          <a>WeCare</a>
        </Link>
      </div>
      {isAuthenticated ? (
        <div className="flex items-center space-x-6">
          <div className="text-sm text-right">
            👤 {user.name}
            <br />
            🔰 {user.role}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            ออกจากระบบ
          </button>
        </div>
      ) : (
        <nav className="space-x-4">
          <Link href="/">
            <a className="hover:underline">หน้าแรก</a>
          </Link>
          <Link href="/login">
            <a className="hover:underline">เข้าสู่ระบบ</a>
          </Link>
          <Link href="/register">
            <a className="hover:underline">สมัครสมาชิก</a>
          </Link>
        </nav>
      )}
    </header>
  );
}
