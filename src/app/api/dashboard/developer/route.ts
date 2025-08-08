import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for the developer dashboard
  const mockData = {
    apiStatus: {
      title: 'API Status',
      data: [
        { name: '/api/auth/profile', status: 'OK', responseTime: '120ms' },
        { name: '/api/patients', status: 'OK', responseTime: '250ms' },
        { name: '/api/community', status: 'Degraded', responseTime: '1500ms' },
      ],
    },
    databaseMetrics: {
      title: 'Database Metrics',
      data: [
        { metric: 'Connections', value: '87/100' },
        { metric: 'CPU Utilization', value: '45%' },
        { metric: 'Slow Queries', value: '3' },
      ],
    },
    recentDeployments: {
      title: 'Recent Deployments',
      data: [
        { id: 'dpl_abc123', status: 'Success', timestamp: '2025-08-07T15:30:00Z' },
        { id: 'dpl_def456', status: 'Success', timestamp: '2025-08-06T11:00:00Z' },
        { id: 'dpl_ghi789', status: 'Failed', timestamp: '2025-08-05T18:45:00Z' },
      ],
    },
    systemLogs: {
      title: 'System Logs',
      data: [
        { level: 'ERROR', message: 'Failed to connect to Redis', timestamp: '2025-08-07T15:50:10Z' },
        { level: 'WARN', message: 'Disk space is running low', timestamp: '2025-08-07T15:45:22Z' },
        { level: 'INFO', message: 'User `admin` logged in', timestamp: '2025-08-07T15:40:05Z' },
      ],
    },
    userActivity: {
      title: 'User Activity',
      data: [
        { user: 'sa@wecare.com', action: 'Viewed Admin Dashboard', count: 5 },
        { user: 'dev@wecare.com', action: 'Pushed to `dev` branch', count: 12 },
        { user: 'tester@wecare.com', action: 'Reported a bug', count: 2 },
      ],
    },
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(mockData);
}
