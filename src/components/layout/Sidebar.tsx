'use client';

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  UsersIcon,
  TruckIcon,
  HeartIcon,
  XMarkIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { useHasMounted } from '@/hooks/useHasMounted'; // 1. Import useHasMounted

const navigation = [
  { name: 'ภาพรวม (Community)', href: '/dashboard/community', icon: HomeIcon, role: ['COMMUNITY', 'ADMIN'] },
  { name: 'เคสของฉัน (Driver)', href: '/dashboard/driver/cases', icon: TruckIcon, role: ['DRIVER', 'ADMIN'] },
  { name: 'ข้อมูลสาธารณสุข (Officer)', href: '/dashboard/officer', icon: HeartIcon, role: ['OFFICER', 'ADMIN'] },
  { name: 'จัดการผู้ใช้ (Admin)', href: '/dashboard/admin', icon: UsersIcon, role: ['ADMIN'] },
  { name: 'รายงานสรุป (Executive)', href: '/dashboard/executive', icon: ChartBarIcon, role: ['ADMIN'] },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const SidebarContent = () => {
  const hasMounted = useHasMounted(); // 2. เรียกใช้ hook
  const { role: userRole, logout } = useAuth();

  // 3. เราจะอ่าน pathname ก็ต่อเมื่อ component ถูก mount
  const pathname = hasMounted ? window.location.pathname : '';

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <a href="/dashboard" className="text-2xl font-bold text-white">WeCare</a>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation
                .filter(item => userRole === 'DEVELOPER' || (userRole && item.role.includes(userRole)))
                .map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={classNames(
                        pathname.startsWith(item.href)
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      )}
                    >
                      <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                      {item.name}
                    </a>
                  </li>
                ))}
            </ul>
          </li>
          <li className="mt-auto">
            <button
              onClick={logout}
              className="w-full text-left text-gray-400 hover:text-white hover:bg-gray-800 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            >
              ออกจากระบบ
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export const Sidebar = () => (
  <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
    <SidebarContent />
  </div>
);

export const SidebarMobile = ({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) => (
  <Transition.Root show={sidebarOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
      <Transition.Child
        as={Fragment}
        enter="transition-opacity ease-linear duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-gray-900/80" />
      </Transition.Child>
      <div className="fixed inset-0 flex">
        <Transition.Child
          as={Fragment}
          enter="transition ease-in-out duration-300 transform"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </Transition.Child>
            <SidebarContent />
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition.Root>
);
