import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import { rateLimit } from '@/lib/rateLimit';
import { withAcl } from '@/lib/acl';
import { PatientProfileSchema } from '@/schemas/patientProfile.schema';


// ฟังก์ชันสำหรับแปลงคำนำหน้าเป็นเพศ
const getGenderFromPrefix = (prefix: string): 'ชาย' | 'หญิง' => {
  if (['นาย', 'เด็กชาย'].includes(prefix)) {
    return 'ชาย';
  }
  return 'หญิง';
};



  
    
  }
  


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
    // Validate core patient profile fields
    const validation = PatientProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid input data', details: validation.error.flatten() }, { status: 400 });
    }
    const profile = validation.data;
    // Parse Buddhist date dd-MM-yyyy to Gregorian Date
    const [dd, mm, byear] = profile.birthDate.split('-').map(Number);
    const birthDate = new Date(byear - 543, mm - 1, dd);
    console.log('🛠️ POST /api/patients validated profile:', profile);
    console.log('🛠️ POST /api/patients body:', body);
    
    
    

    
      
    }
    
    // Use body for additional fields, profile for validated core fields
    const data = body; // keep raw for other properties
    console.log('🛠️ POST /api/patients data for create:', data);
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
        birthDate: birthDate,
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

// Export for unit testing
export { createPatient };
export const GET = withAuth(rateLimit(withAcl(getPatients, ['COMMUNITY','OFFICER','ADMIN','DEVELOPER'])));
