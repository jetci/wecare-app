import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// Mock data for the admin dashboard
const getAdminDashboardData = () => {
  return {
    totalUsers: 1250,
    activeSessions: 342,
    errorRate: '1.2%',
    systemHealth: 'OK',
    recentActivities: [
      { id: 1, user: 'user@example.com', action: 'LOGIN_SUCCESS', timestamp: new Date().toISOString() },
      { id: 2, user: 'admin@example.com', action: 'UPDATED_SETTINGS', timestamp: new Date().toISOString() },
      { id: 3, user: 'driver@example.com', action: 'CASE_CLOSED', timestamp: new Date().toISOString() },
    ],
  };
};

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult; // Return error response if auth fails
    }

    if (authResult.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const data = getAdminDashboardData();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API /dashboard/admin] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
