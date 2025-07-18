import { z } from 'zod';

// Helper function for Thai National ID checksum validation
const isValidThaiID = (id: string) => {
  if (!/^\d{13}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i), 10) * (13 - i);
  }
  const checksum = (11 - (sum % 11)) % 10;
  return checksum === parseInt(id.charAt(12), 10);
};

export const patientFormSchema = z.object({
  prefix: z.enum(['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง'], { required_error: 'กรุณาเลือกคำนำหน้า' }),
  firstName: z.string().min(1, 'กรุณากรอกชื่อจริง'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  nationalId: z.string().refine(isValidThaiID, { message: 'เลขบัตรประชาชนไม่ถูกต้อง' }),
  // Auto-filled gender based on prefix
  gender: z.enum(['ชาย', 'หญิง']),
  
  // [FIX] ใช้ z.coerce.date เพื่อรับ Date หรือ string
  birthDate: z.coerce.date({ required_error: 'กรุณาเลือกวันเกิด' }),
  
  bloodType: z.enum(['A', 'B', 'AB', 'O']).optional(),
  
  // ID Card Address
  idCardAddress_houseNumber: z.string().min(1, 'กรุณากรอกบ้านเลขที่'),
  idCardAddress_moo: z.string().min(1, 'กรุณาเลือกหมู่'),
  idCardAddress_phone: z.string().regex(/^\d*$/, 'กรุณากรอกเฉพาะตัวเลข').optional(),

  // Current Address
  useIdCardAddress: z.boolean().default(false),
  currentAddress_houseNumber: z.string().optional(),
  currentAddress_moo: z.string().optional(),
  currentAddress_tambon: z.string().optional(),
  currentAddress_amphoe: z.string().optional(),
  currentAddress_changwat: z.string().optional(),
  currentAddress_phone: z.string().regex(/^\d*$/, 'กรุณากรอกเฉพาะตัวเลข').optional(),

  // Patient Group
  patientGroup: z.enum(['ผู้ยากไร้', 'ผู้ป่วยติดเตียง', 'อื่นๆ']),
  otherPatientGroup: z.string().optional(),

  // Pickup Location
  pickupLocation_lat: z.number({ required_error: 'กรุณาปักหมุดตำแหน่ง' }),
  pickupLocation_lng: z.number({ required_error: 'กรุณาปักหมุดตำแหน่ง' }),
  notes: z.string().max(200, 'หมายเหตุต้องไม่เกิน 200 ตัวอักษร').optional(),
  basicHealthInfo: z.string().optional(),
}).refine(data => {
    if (data.patientGroup === 'อื่นๆ') {
        return data.otherPatientGroup && data.otherPatientGroup.trim().length > 0;
    }
    return true;
}, {
    message: 'กรุณาระบุรายละเอียดกลุ่มผู้ป่วย',
    path: ['otherPatientGroup'],
}).refine(data => {
    if (!data.useIdCardAddress) {
        return (
            data.currentAddress_houseNumber?.trim().length > 0 &&
            data.currentAddress_moo?.trim().length > 0
        );
    }
    return true;
}, {
    message: 'กรุณากรอกข้อมูลที่อยู่ปัจจุบัน',
    path: ['currentAddress_houseNumber'],
});

export type PatientFormData = z.infer<typeof patientFormSchema>;