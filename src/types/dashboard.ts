// src/types/dashboard.ts

import type { ComponentType } from 'react';

export interface CacheStats {
  hits: number
  misses: number
  keysCount: number
}

export interface JobStats {
  successCount: number
  failedCount: number
  items: unknown[] // TODO: define Job type
}

export interface DeploymentStats {
  pendingCount: number
  successCount: number
  failureCount: number
  lastDeployed: string // ISO timestamp
}

export interface HealthPoint {
  timestamp: string // ISO timestamp
  cpuUsage: number
  memoryUsage: number
  dbConnections: number
}

export interface SystemHealth {
  cpuUsage: number
  memoryUsage: number
  dbConnections: number
}

export interface Notification {
  id: string
  message: string
  timestamp: string // ISO timestamp
}

export interface Community {
  id: string
  name: string
  total: number
  inCare: number
  transferred: number
}

export interface Patient {
  id: string
  name: string
  status: string
}

// Dashboard menu item type
export interface DashboardMenuItem {
  key: string
  title: string
  path: string
  icon?: ComponentType<unknown>
  children?: DashboardMenuItem[]
}

export interface DashboardMenus {
  community: DashboardMenuItem[]
  driver: DashboardMenuItem[]
  healthOfficer: DashboardMenuItem[]
  executive: DashboardMenuItem[]
  admin: DashboardMenuItem[]
}

// Menu structure configuration placeholder
// define dashboardMenus in a separate file

export interface Patient {
  id: string
  name: string
  status: string
}