// app/api/patients/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import { patientFormSchema } from '@/schemas/community/patient.schema';

/**
 * POST /api/patients
 * สร้างผู้ป่วยใหม่ โดยตรวจสอบบทบาทก่อน
 */
const createPatient: AuthenticatedApiHandler = async (req, _ctx, session) => {
  const allowedRoles = ['COMMUNITY', 'OFFICER', 'DEVELOPER'];
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = patientFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const newPatient = await prisma.patient.create({
      data: {
        ...parsed.data,
        birthDate: new Date(parsed.data.birthDate),
        managedByUserId: session.userId,
      },
    });

    return NextResponse.json({ success: true, patient: newPatient }, { status: 201 });
  } catch (err) {
    console.error('🔥 POST /api/patients Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

/**
 * GET /api/patients
 * ดึงรายการผู้ป่วยที่ผู้ใช้ดูแล
 */
const getPatients: AuthenticatedApiHandler = async (_req, _ctx, session) => {
  try {
    const patients = await prisma.patient.findMany({
      where: { managedByUserId: session.userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, patients }, { status: 200 });
  } catch (err) {
    console.error('🔥 GET /api/patients Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

// ห่อหุ้มด้วย withAuth เพื่อจัดการ session และ token ให้อัตโนมัติ
export const POST = withAuth(createPatient);
export const GET  = withAuth(getPatients);