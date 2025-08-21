import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b">
        <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            <span className="text-2xl font-bold text-gray-800">WeCare</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-gray-600">
          <Link href="/" className="hover:text-blue-600">หน้าแรก</Link>
          <Link href="/about" className="hover:text-blue-600">เกี่ยวกับเรา</Link>
          <Link href="/faq" className="hover:text-blue-600">FAQ</Link>
          <Link href="/contact" className="hover:text-blue-600">ติดต่อเรา</Link>
        </nav>
        <div className="flex items-center space-x-2">
          <Link href="/register" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">สมัครสมาชิก</Link>
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">เข้าสู่ระบบ</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900">WeCare ใส่ใจทุกการเดินทาง</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          เราให้บริการนำส่งผู้ป่วยไปยังสถานพยาบาลด้วยความปลอดภัยและรวดเร็ว ลงทะเบียนเพื่อขอรับบริการหรือเข้าร่วมเป็นส่วนหนึ่งกับเรา
        </p>
        <Link href="/register" className="px-8 py-3 mt-8 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700">
          เริ่มต้นใช้งาน
        </Link>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-white bg-gray-800">
        <div className="container flex flex-col items-center justify-between px-8 mx-auto md:flex-row">
            <div className="text-center md:text-left">
                <h3 className="text-lg font-bold">WeCare Project</h3>
                <p className="text-sm text-gray-400">โดย องค์การบริหารส่วนตำบลเวียง</p>
                <a href="http://www.wiang.go.th" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">www.wiang.go.th</a>
            </div>
            <div className="mt-4 text-sm text-center text-gray-400 md:mt-0">
                <p>&copy; {new Date().getFullYear()} องค์การบริหารส่วนตำบลเวียง. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}
