import { NextResponse } from 'next/server';
import { appointmentParamsSchema } from '@/lib/officer.schema';
import prisma from '@/lib/prisma';

// POST /api/officer/appointments/[id]/deny
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const parsed = appointmentParamsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { id } = parsed.data;
  const appointment = await prisma.appointment.update({ where: { id }, data: { status: 'denied' } });
  return NextResponse.json(appointment);
}
