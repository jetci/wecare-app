import { z } from 'zod';

/**
 * Schema for Patient Profile domain
 */
export const PatientProfileSchema = z.object({
  fullName: z.string().min(1, { message: 'กรุณากรอกชื่อ-นามสกุลผู้ป่วย' }),
  hospitalNumber: z.string().min(1, { message: 'กรุณากรอกหมายเลขโรงพยาบาล' }),
  nationalId: z.string().length(13, { message: 'เลขบัตรประชาชนต้องมี 13 หลัก' }),
  birthDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'วันเกิดไม่ถูกต้อง' }),
  allergies: z.array(z.string()).optional(),
  chronicDiseases: z.array(z.string()).optional(),
  emergencyContact: z
    .object({
      name: z.string().min(1, { message: 'กรุณากรอกชื่อผู้ติดต่อฉุกเฉิน' }),
      phone: z
        .string()
        .refine((val) => /^[0-9]{9,10}$/.test(val), { message: 'เบอร์โทรศัพท์ผู้ติดต่อไม่ถูกต้อง' }),
    })
    .optional(),
});

export type PatientProfileForm = z.infer<typeof PatientProfileSchema>;
