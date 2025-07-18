import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import { z } from 'zod';

// Schema สำหรับตรวจสอบข้อมูลที่ส่งเข้ามาใน POST request เพื่อจัดการ Action
const driverActionSchema = z.object({
  rideId: z.string().uuid('Invalid ride ID format'),
  action: z.enum(['accept', 'complete'], {
    errorMap: () => ({ message: "Action must be 'accept' or 'complete'" }),
  }),
});

/**
 * Handler สำหรับดึงรายการเคสที่เกี่ยวข้องกับคนขับ
 */
const getDriverCases: AuthenticatedApiHandler = async (req, context, session) => {
  if (session.role !== 'DRIVER' && session.role !== 'DEVELOPER') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  try {
    const cases = await prisma.ride.findMany({
      where: {
        status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] },
        OR: [
          { driverId: null },
          { driverId: session.userId },
        ],
      },
      include: { patient: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, cases });
  } catch (error) {
    console.error('🔥 GET /api/driver/cases Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

/**
 * Handler สำหรับจัดการ Action ของคนขับ (รับงาน / จบงาน)
 */
const postDriverAction: AuthenticatedApiHandler = async (req, context, session) => {
  if (session.role !== 'DRIVER' && session.role !== 'DEVELOPER') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON format' }, { status: 400 });
  }
  const parsed = driverActionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
  }
  const { rideId, action } = parsed.data;
  try {
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) {
      return NextResponse.json({ success: false, error: 'Ride not found' }, { status: 404 });
    }
    let updatedRide;
    if (action === 'accept') {
      if (ride.status !== 'PENDING' || ride.driverId) {
        return NextResponse.json({ success: false, error: 'Ride is already taken or not available' }, { status: 409 });
      }
      updatedRide = await prisma.ride.update({ where: { id: rideId }, data: { status: 'ACCEPTED', driverId: session.userId } });
    } else {
      if (ride.driverId !== session.userId || ride.status !== 'IN_PROGRESS') {
        return NextResponse.json({ success: false, error: 'Cannot complete this ride' }, { status: 403 });
      }
      updatedRide = await prisma.ride.update({ where: { id: rideId }, data: { status: 'COMPLETED' } });
    }
    return NextResponse.json({ success: true, ride: updatedRide });
  } catch (error) {
    console.error('🔥 POST /api/driver/cases Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

export const GET = withAuth(getDriverCases);
export const POST = withAuth(postDriverAction);
