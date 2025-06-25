import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Home, FileText, Users, Settings } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Reports',   href: '/reports',   icon: FileText },
  { label: 'Users',     href: '/admin/users', icon: Users },
  { label: 'Settings',  href: '/admin/settings', icon: Settings },
]

export default function Sidebar() {
  const { pathname } = useRouter()
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => { setToken(localStorage.getItem('accessToken')); }, []);
  const itemsToShow = token ? navItems : navItems.filter(item => item.label !== 'Dashboard');
  return (
    <aside className="hidden lg:flex flex-col w-64 p-4 bg-white dark:bg-gray-800 shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-[#1976d2]">WeCare</h1>
      <nav className="flex-1 space-y-2">
        {itemsToShow.map(item => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} passHref>
              <a
                className={`flex items-center p-2 rounded-lg transition-colors hover:bg-[#E3F2FD] dark:hover:bg-gray-700 ${
                  active ? 'bg-[#E3F2FD] dark:bg-gray-700' : ''
                }`}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-800 dark:text-gray-100 font-medium">{item.label}</span>
              </a>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
