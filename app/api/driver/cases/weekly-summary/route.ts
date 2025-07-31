import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { weeklySummarySchema } from '../../../../dashboard/driver/lib/driverCases';
import { format } from 'date-fns';

export async function GET() {
  const raw = await prisma.ride.groupBy({
    by: ['date', 'status'],
    where: { status: { in: ['ACCEPTED', 'PENDING', 'CANCELLED'] } },
    _count: { _all: true },
  });

  const grouping: Record<string, { approved: number; pending: number; canceled: number }> = {};
  for (const r of raw) {
    const key = format(r.date, 'yyyy-MM-dd');
    grouping[key] = grouping[key] || { approved: 0, pending: 0, canceled: 0 };
    if (r.status === 'ACCEPTED') grouping[key].approved += r._count._all;
    if (r.status === 'PENDING') grouping[key].pending += r._count._all;
    if (r.status === 'CANCELLED') grouping[key].canceled += r._count._all;
  }

  const summary = Object.entries(grouping).map(([date, counts]) => ({ date, ...counts }));
  const data = weeklySummarySchema.parse(summary);
  return NextResponse.json(data);
}
