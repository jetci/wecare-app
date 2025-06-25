import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Schema for patient data
export const patientSchema = z.object({
  prefix: z.enum(['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง']),
  gender: z.enum(['male', 'female']),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nationalId: z.string().length(13),
  birthDate: z.string().min(1),
  bloodType: z.enum(['A', 'B', 'AB', 'O', 'ไม่ทราบ']),
  phone: z.string().min(1),
  houseNumber: z.string().min(1),
  moo: z.string().min(1),
  tambon: z.string().min(1),
  amphoe: z.string().min(1),
  province: z.string().min(1),
  currentAddressSame: z.boolean(),
  currentHouseNumber: z.string().optional(),
  currentMoo: z.string().optional(),
  currentSubDistrict: z.string().optional(),
  currentDistrict: z.string().optional(),
  currentProvince: z.string().optional(),
  currentPhone: z.string().optional(),
  patientGroup: z.enum(['ผู้ยากไร้', 'ผู้ป่วยติดเตียง', 'อื่นๆ']),
  otherGroup: z.string().optional(),
  locationNote: z.string().optional(),
  location: z.object({ lat: z.number(), lng: z.number() }),
});

// GET /api/patients
export async function GET(req: NextRequest) {
  const auth = await verifyToken(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const patients = await prisma.patient.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, patients }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST /api/patients
export async function POST(req: NextRequest) {
  const auth = await verifyToken(req);
  if (auth instanceof NextResponse) return auth;

  let data: any;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = patientSchema.safeParse(data);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }
  const pd = result.data;

  // Calculate age from birthDate
  const dob = new Date(pd.birthDate);
  const age = new Date().getFullYear() - dob.getFullYear();

  try {
    const exists = await prisma.patient.findUnique({ where: { nationalId: pd.nationalId } });
    if (exists) return NextResponse.json({ error: 'ผู้ป่วยรายนี้มีอยู่แล้ว' }, { status: 409 });

    const created = await prisma.patient.create({
      data: {
        prefix: pd.prefix,
        firstName: pd.firstName,
        lastName: pd.lastName,
        nationalId: pd.nationalId,
        phone: pd.phone,
        dob,
        age,
        gender: pd.gender,
        bloodGroup: pd.bloodType,
        addrNo: pd.houseNumber,
        addrMoo: pd.moo,
        villageName: pd.tambon,
        copyAddr: pd.currentAddressSame,
        currNo: pd.currentHouseNumber || '',
        currMoo: pd.currentMoo || '',
        currVillageName: pd.currentSubDistrict || '',
        currSub: pd.currentSubDistrict || '',
        currDist: pd.currentDistrict || '',
        currProv: pd.currentProvince || '',
        latitude: pd.location.lat,
        longitude: pd.location.lng,
        locationLabel: pd.locationNote || '',
        patientGroup: pd.patientGroup,
        otherGroup: pd.otherGroup || '',
      },
    });
    return NextResponse.json({ success: true, patient: created }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
