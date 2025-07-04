import type { DashboardMenus } from '@/types/dashboard';
import {
  Home,
  ClipboardList,
  Users,
  Bell,
  FileText,
  BarChart2,
  Truck,
  Clock,
  PieChart,
  Activity,
  Cpu,
  Database,
  HardDrive,
  Settings,
} from 'lucide-react';

export const dashboardMenus: DashboardMenus = {
  community: [
    { key: 'home', title: 'Dashboard', path: '/dashboard/community', icon: Home },
    { key: 'requests', title: 'Community Requests', path: '/dashboard/community/request', icon: ClipboardList },
    { key: 'patients', title: 'Patients', path: '/dashboard/community/patients', icon: Users },
    { key: 'notifications', title: 'Notifications', path: '/dashboard/community/notifications', icon: Bell },
    { key: 'history', title: 'History', path: '/dashboard/community/history', icon: FileText },
    { key: 'reports', title: 'Reports', path: '/dashboard/community/reports', icon: BarChart2 },
  ],
  driver: [
    { key: 'home', title: 'Dashboard', path: '/dashboard/driver', icon: Home },
    { key: 'myRides', title: 'My Rides', path: '/dashboard/driver/my-rides', icon: Truck },
    { key: 'availability', title: 'Availability', path: '/dashboard/driver/availability', icon: Clock },
    { key: 'notifications', title: 'Notifications', path: '/dashboard/driver/notifications', icon: Bell },
    { key: 'history', title: 'History', path: '/dashboard/driver/history', icon: FileText },
    { key: 'profile', title: 'Profile', path: '/dashboard/driver/profile', icon: Users },
  ],
  healthOfficer: [
    { key: 'home', title: 'Dashboard', path: '/dashboard/health-officer', icon: Home },
    { key: 'communityStats', title: 'Community Stats', path: '/dashboard/health-officer/community', icon: PieChart },
    { key: 'patients', title: 'Patients', path: '/dashboard/health-officer/patients', icon: Users },
    { key: 'healthPoints', title: 'Health Points', path: '/dashboard/health-officer/health-points', icon: Activity },
    { key: 'reports', title: 'Reports', path: '/dashboard/health-officer/reports', icon: BarChart2 },
    { key: 'notifications', title: 'Notifications', path: '/dashboard/health-officer/notifications', icon: Bell },
  ],
  executive: [
    { key: 'home', title: 'Dashboard', path: '/dashboard/executive', icon: Home },
    { key: 'kpis', title: 'KPIs', path: '/dashboard/executive/kpis', icon: BarChart2 },
    { key: 'trends', title: 'Trends', path: '/dashboard/executive/trends', icon: Activity },
    { key: 'leaderboard', title: 'Leaderboard', path: '/dashboard/executive/leaderboard', icon: Users },
    { key: 'reports', title: 'Reports', path: '/dashboard/executive/reports', icon: FileText },
    { key: 'notifications', title: 'Notifications', path: '/dashboard/executive/notifications', icon: Bell },
  ],
  admin: [
    { key: 'home', title: 'Dashboard', path: '/dashboard/admin', icon: Home },
    { key: 'userManagement', title: 'User Management', path: '/dashboard/admin/users', icon: Users },
    { key: 'systemHealth', title: 'System Health', path: '/dashboard/admin/system-health', icon: Cpu },
    { key: 'cacheStats', title: 'Cache Stats', path: '/dashboard/admin/cache-stats', icon: Database },
    { key: 'deployment', title: 'Deployment', path: '/dashboard/admin/deployment', icon: HardDrive },
    { key: 'settings', title: 'Settings', path: '/dashboard/admin/settings', icon: Settings },
    { key: 'notifications', title: 'Notifications', path: '/dashboard/admin/notifications', icon: Bell },
  ],
};
