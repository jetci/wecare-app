import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { mockRides } from '../mocks';

// simple UUID v4 regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// GET one ride by id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!uuidRegex.test(params.id)) {
    return NextResponse.json({ success: false, code: 'INVALID_RIDE_ID', message: 'Invalid ride ID format' }, { status: 400 });
  }
  const authRes = await verifyToken(req);
  if (authRes instanceof NextResponse) return authRes;
  // find in-memory ride
  const ride = mockRides.find(r => r.id === params.id);
  if (!ride) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, ride });
}
