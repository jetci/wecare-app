import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// Mock data for the health officer dashboard
const getHealthOfficerDashboardData = () => {
  return {
    totalPatients: 150,
    pendingAssessments: 12,
    averageResponseTime: '15 mins',
    highPriorityCases: 3,
    recentActivities: [
      { id: 1, caseId: 'CASE-00456', action: 'ASSESSMENT_COMPLETED', timestamp: new Date().toISOString() },
      { id: 2, caseId: 'CASE-00457', action: 'NEW_CASE_ASSIGNED', timestamp: new Date().toISOString() },
    ],
  };
};

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult; // Return error response if auth fails
    }

    if (authResult.role !== 'HEALTH_OFFICER') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const data = getHealthOfficerDashboardData();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API /dashboard/health-officer] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
