import { NextResponse } from 'next/server';
import { officerQuerySchema } from '@/lib/officer.schema';
import prisma from '@/lib/prisma';

// GET /api/officer/appointments?area=...
// Validate query params
const querySchema = officerQuerySchema;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { area } = parsed.data;
  // ใช้ any เพื่อหลบ TypeScript type error ชั่วคราว
  const filter: any = {};
  if (area) filter.area = area;
  const appointments = await prisma.appointment.findMany({ where: filter });
  return NextResponse.json(appointments);
}
