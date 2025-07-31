import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// In-memory mock patients array for tests
export const mockPatients: any[] = [];

/** GET /api/patients */
export async function GET(req: NextRequest) {
  const sessionOrResponse = await verifyAuth(req);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }
  const session = sessionOrResponse;
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ patients: mockPatients }, { status: 200 });
}

/** POST /api/patients */
export async function POST(req: NextRequest) {
  const sessionOrResponse = await verifyAuth(req);
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }
  const session = sessionOrResponse;
  if (!session || (session.role !== 'COMMUNITY' && session.role !== 'OFFICER')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  if (!body.nationalId || !body.firstName || !body.lastName) {
    return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
  }
  const patient = {
    nationalId: body.nationalId,
    firstName: body.firstName,
    lastName: body.lastName,
  };
  mockPatients.push(patient);
  return NextResponse.json({ patient }, { status: 201 });
}