import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import { rateLimit } from '@/lib/rateLimit';
import { withAcl } from '@/lib/acl';
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
    console.log('🛠️ POST /api/patients body:', body);
    // ใช้ Schema สำหรับ API ในการ Parse และ Transform ข้อมูล
    const parsedData = apiPatientSchema.safeParse(body);
    console.log('🛠️ POST /api/patients parsedData:', parsedData);

    if (!parsedData.success) {
      return NextResponse.json({ success: false, error: 'Invalid input data', details: parsedData.error.flatten() }, { status: 400 });
    }
    
    const data = parsedData.data;
    console.log('🛠️ POST /api/patients data for create:', data);

    // ตรวจสอบความซ้ำกันของ nationalId
    const existingPatient = await prisma.patient.findUnique({
      where: { nationalId: data.nationalId },
    });
    if (existingPatient) {
      return NextResponse.json({ success: false, error: 'มีผู้ป่วยรหัสประชาชนนี้ในระบบแล้ว' }, { status: 409 });
    }

    const newPatient = await prisma.patient.create({
      data: {
        prefix: data.prefix,
        firstName: data.firstName,
        lastName: data.lastName,
        nationalId: data.nationalId,
        gender: data.gender,
        bloodType: data.bloodType,
        birthDate: data.birthDate,
        // ID Card Address
        idCardAddress_houseNumber: data.idCardAddress_houseNumber,
        idCardAddress_moo: data.idCardAddress_moo,
        idCardAddress_phone: data.idCardAddress_phone,
        // Current Address
        
        currentAddress_houseNumber: data.useIdCardAddress ? data.idCardAddress_houseNumber : data.currentAddress_houseNumber,
        currentAddress_moo: data.useIdCardAddress ? data.idCardAddress_moo : data.currentAddress_moo,
        currentAddress_tambon: data.useIdCardAddress ? data.idCardAddress_tambon : data.currentAddress_tambon,
        currentAddress_amphoe: data.useIdCardAddress ? data.idCardAddress_amphoe : data.currentAddress_amphoe,
        currentAddress_changwat: data.useIdCardAddress ? data.idCardAddress_changwat : data.currentAddress_changwat,
        currentAddress_phone: data.useIdCardAddress ? data.idCardAddress_phone : data.currentAddress_phone,
        // Patient Group
        patientGroup: data.patientGroup,
        otherPatientGroup: data.patientGroup === 'อื่นๆ' ? data.otherPatientGroup : null,
        // Pickup Location
        pickupLocation_lat: data.pickupLocation_lat,
        pickupLocation_lng: data.pickupLocation_lng,
        notes: data.notes,
        // Relation to User
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
const getPatients: AuthenticatedApiHandler = async (req, _ctx, session) => {
  // If nationalId provided, return specific patient
  const nationalId = req.nextUrl.searchParams.get('nationalId');
  if (nationalId) {
    const patient = await prisma.patient.findUnique({ where: { nationalId } });
    if (!patient || patient.managedByUserId !== session.userId) {
      return NextResponse.json({ success: false, error: 'ไม่พบผู้ป่วย' }, { status: 404 });
    }
    return NextResponse.json({ success: true, patient });
  }

  try {
    const patients = await prisma.patient.findMany({
      where: { managedByUserId: session.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        nationalId: true,
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

export const POST = withAuth(rateLimit(withAcl(createPatient, ['COMMUNITY','OFFICER','ADMIN','DEVELOPER'])));
export const GET = withAuth(rateLimit(withAcl(getPatients, ['COMMUNITY','OFFICER','ADMIN','DEVELOPER'])));
