import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { verifyAuth } from '@/lib/auth';

// Mock data for the community dashboard
const getCommunityDashboardData = () => {
  return {
    activeRequests: 45,
    totalPatients: 1200,
    volunteersOnline: 89,
    recentUpdates: [
      { id: 1, type: 'New Request', details: 'Emergency assistance needed in District 5.', timestamp: new Date().toISOString() },
      { id: 2, type: 'Patient Update', details: 'Patient ID 789 has been safely transported.', timestamp: new Date().toISOString() },
      { id: 3, type: 'Announcement', details: 'Blood drive this weekend at the city center.', timestamp: new Date().toISOString() },
    ],
  };
};

export async function GET(request: NextRequest) {
  try {
    // รับ token ทั้งจาก header และ cookie
    const headerToken = request.headers.get('authorization')?.split(' ')[1];
    const cookieToken = request.cookies.get('accessToken')?.value;
    const token = headerToken || cookieToken;

    if (!token) {
      return NextResponse.json({ message: 'Authorization token is missing.' }, { status: 401 });
    }

    const authResult = await verifyAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Log comparison
    const decodedTokenRole = jwtDecode<{ role?: string }>(token).role || 'N/A';
    console.log(`[JWT DEBUG] Decoded Role: '${decodedTokenRole}', verifyAuth Role: '${authResult.role}'`);

    // Role-Based Access Control (RBAC)
    const { role } = authResult;
    const allowedRoles = ['COMMUNITY', 'ADMIN', 'DEVELOPER'];
    console.log(`[API Community Dashboard] Checking access for role: '${role}'. Allowed roles: [${allowedRoles.join(', ')}]`);

    if (!allowedRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())) {
      return NextResponse.json(
        { message: `Forbidden: Role '${role}' is not authorized to access this resource.` },
        { status: 403 }
      );
    }

    const data = getCommunityDashboardData();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API /dashboard/community] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
