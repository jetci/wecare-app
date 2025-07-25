import { z } from 'zod';

/**
 * Schema for Patient Profile domain
 */
export const PatientProfileSchema = z.object({
  fullName: z.string().min(1, { message: 'กรุณากรอกชื่อ-นามสกุลผู้ป่วย' }),
  hospitalNumber: z.string().min(1, { message: 'กรุณากรอกหมายเลขโรงพยาบาล' }),
  nationalId: z.string().length(13, { message: 'เลขบัตรประชาชนต้องมี 13 หลัก' }),
  birthDate: z.string()
    .regex(/^\d{2}-\d{2}-\d{4}$/, { message: 'รูปแบบวันที่ต้องเป็น dd-MM-yyyy' })
    .refine((val) => {
      const [dd, mm, yyyy] = val.split('-').map(Number);
      return yyyy >= 2500 && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31;
    }, { message: 'ปีต้องไม่น้อยกว่า 2500 และรูปแบบต้องถูกต้อง' }),
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
