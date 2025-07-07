import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// POST /api/officer/appointments/[id]/approve
const paramsSchema = z.object({ id: z.string().uuid() });

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const parsed = paramsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { id } = parsed.data;
  const appointment = await prisma.appointment.update({ where: { id }, data: { status: 'approved' } });
  return NextResponse.json(appointment);
}
