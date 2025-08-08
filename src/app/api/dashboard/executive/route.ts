import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// Mock data for the executive dashboard
const getExecutiveDashboardData = () => {
  return {
    strategicKPIs: {
      overallSatisfaction: '92%',
      systemUptime: '99.98%',
      budgetAdherence: '95%',
      resourceUtilization: '88%',
    },
    monthlyTrend: [
      { month: 'Jan', cases: 400, satisfaction: 88 },
      { month: 'Feb', cases: 380, satisfaction: 90 },
      { month: 'Mar', cases: 420, satisfaction: 91 },
      { month: 'Apr', cases: 450, satisfaction: 92 },
    ],
  };
};

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult; // Return error response if auth fails
    }

    if (authResult.role !== 'EXECUTIVE') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const data = getExecutiveDashboardData();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API /dashboard/executive] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
