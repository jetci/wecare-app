import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import { patientFormSchema } from '@/schemas/community/patient.schema';
import { z } from 'zod';

// ฟังก์ชันสำหรับแปลงคำนำหน้าเป็นเพศ
const getGenderFromPrefix = (prefix: string): 'ชาย' | 'หญิง' => {
  if (['นาย', 'เด็กชาย'].includes(prefix)) {
    return 'ชาย';
  }
  return 'หญิง';
};

// Schema for API: preprocess birthDate string into Date before validation
const apiPatientSchema = z.preprocess((body) => {
  if (body && typeof (body as any).birthDate === 'string') {
    return { ...(body as any), birthDate: new Date((body as any).birthDate) };
  }
  return body;
}, patientFormSchema);

/**
 * Handler สำหรับสร้างข้อมูลผู้ป่วยใหม่
 * POST /api/patients
 */
const createPatient: AuthenticatedApiHandler = async (req, context, session) => {
  const allowedRoles = ['COMMUNITY', 'OFFICER', 'ADMIN', 'DEVELOPER'];
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    // ใช้ Schema สำหรับ API ในการ Parse และ Transform ข้อมูล
    const parsedData = apiPatientSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ success: false, error: 'Invalid input data', details: parsedData.error.flatten() }, { status: 400 });
    }
    
    const data = parsedData.data;

    // ตรวจสอบความซ้ำกันของ nationalId
    const existingPatient = await prisma.patient.findUnique({
      where: { nationalId: data.nationalId },
    });
    if (existingPatient) {
      return NextResponse.json({ success: false, error: 'มีผู้ป่วยรหัสประชาชนนี้ในระบบแล้ว' }, { status: 409 });
    }

    const newPatient = await prisma.patient.create({
      data: {
        ...data,
        // birthDate ตอนนี้เป็น Date object ที่พร้อมสำหรับ Prisma แล้ว
        birthDate: data.birthDate,
        // gender ถูกส่งมาจากฟอร์มที่ผ่านการคำนวณแล้ว
        gender: data.gender,

        // กำหนดค่าที่อยู่ตามบัตรประชาชน (ค่าคงที่)
        idCardAddress_tambon: 'เวียง',
        idCardAddress_amphoe: 'ฝาง',
        idCardAddress_changwat: 'เชียงใหม่',

        // กำหนดค่าที่อยู่ปัจจุบันตามเงื่อนไข
        currentAddress_houseNumber: data.useIdCardAddress ? data.idCardAddress_houseNumber : data.currentAddress_houseNumber,
        currentAddress_moo: data.useIdCardAddress ? data.idCardAddress_moo : data.currentAddress_moo,
        currentAddress_tambon: data.useIdCardAddress ? 'เวียง' : data.currentAddress_tambon,
        currentAddress_amphoe: data.useIdCardAddress ? 'ฝาง' : data.currentAddress_amphoe,
        currentAddress_changwat: data.useIdCardAddress ? 'เชียงใหม่' : data.currentAddress_changwat,
        currentAddress_phone: data.useIdCardAddress ? data.idCardAddress_phone : data.currentAddress_phone,

        otherPatientGroup: data.patientGroup === 'อื่นๆ' ? data.otherPatientGroup : null,

        // สร้างความสัมพันธ์กับผู้ใช้ที่ทำการเพิ่มข้อมูลนี้
        managedByUserId: session.userId,
      }
    });

    return NextResponse.json({ success: true, patient: newPatient }, { status: 201 });

  } catch (error) {
    console.error('🔥 POST /api/patients Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

/**
 * Handler สำหรับดึงข้อมูลผู้ป่วยที่อยู่ในความดูแลของผู้ใช้
 * GET /api/patients
 */
const getPatients: AuthenticatedApiHandler = async (_req, _ctx, session) => {
  try {
    const patients = await prisma.patient.findMany({
      where: { managedByUserId: session.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        gender: true
      }
    });

    return NextResponse.json({ success: true, patients });

  } catch (error) {
    console.error('🔥 GET /api/patients Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

export const POST = withAuth(createPatient);
export const GET = withAuth(getPatients);
