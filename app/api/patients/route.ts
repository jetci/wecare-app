// app/api/patients/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import { patientFormSchema } from '@/schemas/community/patient.schema';
import { z } from 'zod';

// [NEW] ฟังก์ชันสำหรับแปลงคำนำหน้าเป็นเพศ
const getGenderFromPrefix = (prefix: string): 'ชาย' | 'หญิง' => {
  if (['นาย', 'เด็กชาย'].includes(prefix)) return 'ชาย';
  return 'หญิง';
};

/**
 * POST /api/patients
 * สร้างผู้ป่วยใหม่ โดยตรวจสอบบทบาทก่อน
 */
const createPatient: AuthenticatedApiHandler = async (req, _ctx, session) => {
  const allowedRoles: string[] = ['COMMUNITY', 'OFFICER', 'ADMIN', 'DEVELOPER'];
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = patientFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // ตรวจสอบความซ้ำกันของ nationalId
    const existing = await prisma.patient.findUnique({ where: { nationalId: data.nationalId } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'มีผู้ป่วยรหัสประชาชนนี้ในระบบแล้ว' }, { status: 409 });
    }

    const newPatient = await prisma.patient.create({
      data: {
        prefix: data.prefix,
        gender: getGenderFromPrefix(data.prefix),
        firstName: data.firstName,
        lastName: data.lastName,
        nationalId: data.nationalId,

        // @ts-ignore: ensure birthDate property is accepted by Prisma schema
        birthDate: new Date(data.birthDate),
        idCardAddress_houseNumber: data.idCardAddress_houseNumber,
        idCardAddress_moo: data.idCardAddress_moo,
        idCardAddress_tambon: 'เวียง',
        idCardAddress_amphoe: 'ฝาง',
        idCardAddress_changwat: 'เชียงใหม่',
        idCardAddress_phone: data.idCardAddress_phone,
        useIdCardAddress: data.useIdCardAddress,
        currentAddress_houseNumber: data.useIdCardAddress
          ? data.idCardAddress_houseNumber
          : data.currentAddress_houseNumber,
        currentAddress_moo: data.useIdCardAddress ? data.idCardAddress_moo : data.currentAddress_moo,
        currentAddress_tambon: data.useIdCardAddress ? 'เวียง' : data.currentAddress_tambon,
        currentAddress_amphoe: data.useIdCardAddress ? 'ฝาง' : data.currentAddress_amphoe,
        currentAddress_changwat: data.useIdCardAddress ? 'เชียงใหม่' : data.currentAddress_changwat,
        currentAddress_phone: data.useIdCardAddress ? data.idCardAddress_phone : data.currentAddress_phone,
        patientGroup: data.patientGroup,
        otherPatientGroup: data.patientGroup === 'อื่นๆ' ? data.otherPatientGroup : null,
        
        pickupLocation_lat: data.pickupLocation_lat,
        pickupLocation_lng: data.pickupLocation_lng,
        notes: data.notes,
        managedByUserId: session.userId,
      },
    });

    return NextResponse.json({ success: true, patient: newPatient }, { status: 201 });
  } catch (error) {
    console.error('🔥 POST /api/patients Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

export const POST = withAuth(createPatient);

