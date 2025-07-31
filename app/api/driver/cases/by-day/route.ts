import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import { rateLimit } from '@/lib/rateLimit';
import { withAcl } from '@/lib/acl';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks } from 'date-fns';
import { th } from 'date-fns/locale';

const getCasesByDay: AuthenticatedApiHandler = async (request, context, session) => {
  if (session.role !== 'DRIVER' && session.role !== 'DEVELOPER' && session.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  const week = request.nextUrl.searchParams.get('week') || 'current';
  let refDate = new Date();
  if (week === 'prev') refDate = addWeeks(refDate, -1);
  if (week === 'next') refDate = addWeeks(refDate, 1);
  const start = startOfWeek(refDate, { weekStartsOn: 1 });
  const end = endOfWeek(refDate, { weekStartsOn: 1 });
  const rides = await prisma.ride.findMany({
    where: {
      driverId: session.userId,
      date: { gte: start, lte: end },
    },
    include: { patient: true },
  });
  const days = eachDayOfInterval({ start, end });
  const record: Record<string, any[]> = {};
  days.forEach(date => {
    const label = format(date, 'EEEE', { locale: th });
    record[label] = [];
  });
  rides.forEach(r => {
    const label = format(r.date, 'EEEE', { locale: th });
    const location = r.patient.currentAddress_houseNumber
      ? `${r.patient.currentAddress_houseNumber} หมู่ ${r.patient.currentAddress_moo}`
      : '';
    record[label].push({
      id: r.id,
      name: `${r.patient.firstName} ${r.patient.lastName}`,
      status: r.status.toLowerCase(),
      time: format(r.date, 'HH:mm'),
      location,
    });
  });
  return NextResponse.json(record);
};

export const GET = withAuth(rateLimit(withAcl(getCasesByDay, ['DRIVER', 'DEVELOPER', 'ADMIN'])));


