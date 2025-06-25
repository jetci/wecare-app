import React from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

interface AppShellProps { children: React.ReactNode }

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex bg-[#E3F2FD] dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="p-4 flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
          {children}
        </main>
      </div>
    </div>
  )
}
