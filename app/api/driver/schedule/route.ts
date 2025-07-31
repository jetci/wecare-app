import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'กรุณาระบุ startDate และ endDate' }, { status: 400 });
  }

  // ดึง token จาก header หรือ cookie
  const auth = request.headers.get('authorization') || '';
  let token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) {
    const cookie = request.cookies.get('accessToken');
    if (cookie) token = typeof cookie === 'string' ? cookie : cookie.value;
  }
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    const userId = (payload as any).userId as string;
    const role = (payload as any).role as string;
    if (role !== 'DRIVER' && role !== 'DEVELOPER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rides = await prisma.ride.findMany({
      where: {
        driverId: userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      select: {
        id: true,
        date: true,
        status: true,
        patient: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    // เตรียมโครงสร้างผลลัพธ์
    const result: Record<string, Array<{ caseId: string; title: string; time: string }>> = {};
    let curr = new Date(startDate);
    const last = new Date(endDate);
    while (curr <= last) {
      const key = curr.toISOString().split('T')[0];
      result[key] = [];
      curr.setDate(curr.getDate() + 1);
    }

    for (const ride of rides) {
      const key = ride.date.toISOString().split('T')[0];
      const time = ride.date.toISOString().split('T')[1].substr(0,5);
      const patientName = `${ride.patient.firstName} ${ride.patient.lastName}`;
      result[key]?.push({ caseId: ride.id, title: patientName, time });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Driver schedule error:', err);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
