'use server';

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import { rateLimit } from '@/lib/rateLimit';
import { withAcl } from '@/lib/acl';

const handler: AuthenticatedApiHandler = async (req, _ctx, session) => {
  const url = new URL(req.url);
  const params = url.searchParams;
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (params.has('month')) {
    const [year, mon] = (params.get('month')!)!.split('-').map(Number);
    startDate = new Date(year, mon - 1, 1);
    endDate = new Date(year, mon, 1);
  } else {
    const sd = params.get('startDate');
    const ed = params.get('endDate');
    if (sd) startDate = new Date(sd);
    if (ed) {
      const d = new Date(ed);
      endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    }
  }

  const where: any = {};
  if (startDate && endDate) where.createdAt = { gte: startDate, lt: endDate };
  else if (startDate) where.createdAt = { gte: startDate };
  else if (endDate) where.createdAt = { lt: endDate };

  // Total patients
  const totalPatients = await prisma.patient.count({ where });

  // Patients by group
  const groupRes = await prisma.patient.groupBy({
    by: ['patientGroup'],
    _count: { patientGroup: true },
    where,
  });
  const byGroup = groupRes.map(g => ({ group: g.patientGroup, count: g._count.patientGroup }));

  // Patients by area
  const areaRes = await prisma.patient.groupBy({
    by: ['currentAddress_changwat', 'currentAddress_amphoe'],
    _count: { _all: true },
    where,
  });
  const byArea = areaRes.map(a => ({ changwat: a.currentAddress_changwat || 'Unknown', amphoe: a.currentAddress_amphoe || 'Unknown', count: a._count._all }));

  return NextResponse.json({ totalPatients, byGroup, byArea });
};

export const GET = withAuth(
  rateLimit(
    withAcl(handler, ['COMMUNITY', 'HEALTH_OFFICER', 'EXECUTIVE', 'ADMIN', 'DEVELOPER'])
  )
);
