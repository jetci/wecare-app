import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// Mock data for the driver dashboard
const getDriverDashboardData = () => {
  return {
    assignedCases: 3,
    pendingPickups: 2,
    completedTripsToday: 5,
    vehicleStatus: 'Operational',
    notifications: [
      { id: 1, message: 'New case assigned: Patient ID 123 at 123 Main St.', timestamp: new Date().toISOString() },
      { id: 2, message: 'Traffic alert: Heavy congestion on Route 4.', timestamp: new Date().toISOString() },
    ],
  };
};

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult; // Return error response if auth fails
    }

    if (authResult.role !== 'DRIVER') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const data = getDriverDashboardData();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API /dashboard/driver] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
