import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import { z } from 'zod';

// Schema สำหรับตรวจสอบข้อมูลที่ส่งเข้ามาใน POST request
const actionSchema = z.object({
  id: z.string().uuid('Invalid ride ID format'),
  action: z.enum(['accept', 'complete'], {
    errorMap: () => ({ message: "Action must be 'accept' or 'complete'" }),
  }),
});

/**
 * Handler สำหรับดึงรายการเคสที่เกี่ยวข้องกับคนขับ
 * - คนขับจะเห็นเคสที่ยังไม่มีคนรับ (PENDING) และเคสของตัวเอง
 */
const getDriverCases: AuthenticatedApiHandler = async (req, context, session) => {
  // ตรวจสอบ Role ซ้ำอีกครั้งเพื่อความปลอดภัยสูงสุด
  if (session.role !== 'DRIVER') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const cases = await prisma.ride.findMany({
      where: {
        // ดึงเคสที่ยังว่าง หรือเป็นเคสที่คนขับคนนี้รับไปแล้ว
        status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] },
        OR: [{ driverId: null }, { driverId: session.userId }],
      },
      include: {
        patient: true, // ดึงข้อมูลผู้ป่วยที่เกี่ยวข้องมาด้วย
      },
      orderBy: {
        createdAt: 'desc',
      },
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
  if (session.role !== 'DRIVER') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON format' }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
  }

  const { id: rideId, action } = parsed.data;

  try {
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });

    if (!ride) {
      return NextResponse.json({ success: false, error: 'Ride not found' }, { status: 404 });
    }

    // Logic การจัดการ action
    let updatedRide;
    if (action === 'accept') {
      if (ride.status !== 'PENDING' || ride.driverId) {
        return NextResponse.json({ success: false, error: 'Ride is already taken or not available' }, { status: 409 }); // 409 Conflict
      }
      updatedRide = await prisma.ride.update({
        where: { id: rideId },
        data: { status: 'ACCEPTED', driverId: session.userId },
      });
    } else { // action === 'complete'
      if (ride.status !== 'IN_PROGRESS' || ride.driverId !== session.userId) {
        return NextResponse.json({ success: false, error: 'Cannot complete this ride' }, { status: 403 });
      }
      updatedRide = await prisma.ride.update({
        where: { id: rideId },
        data: { status: 'COMPLETED' },
      });
    }

    return NextResponse.json({ success: true, ride: updatedRide });
  } catch (error) {
    console.error('🔥 POST /api/driver/cases Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

// Export Handler ที่ห่อหุ้มด้วย withAuth แล้ว
export const GET = withAuth(getDriverCases);
export const POST = withAuth(postDriverAction);

  if (action === 'accept') {
    if (ride.status !== 'PENDING') {
      return NextResponse.json({ success: false, error: 'Cannot accept this ride' }, { status: 400 });
    }
    const updated = await prisma.ride.update({ where: { id }, data: { status: 'ACCEPTED', driverId: userId } });
    return NextResponse.json({ success: true, ride: updated });
  }

  // complete action
  if (ride.driverId !== userId || ride.status !== 'IN_PROGRESS') {
    return NextResponse.json({ success: false, error: 'Cannot complete this ride' }, { status: 400 });
  }
  const updated = await prisma.ride.update({ where: { id }, data: { status: 'COMPLETED' } });
  return NextResponse.json({ success: true, ride: updated });
}
