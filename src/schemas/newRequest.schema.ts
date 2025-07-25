import { z } from 'zod';

// Thai national ID: strip spaces/dashes and validate 13 digits
const nationalIdRegex = /^[0-9]{13}$/;

export const NewRequestSchema = z.object({
  nationalId: z
    .string()
    .transform((val) => val.replace(/[-\s]/g, ''))
    .refine((val) => nationalIdRegex.test(val), {
      message: 'เลขบัตรประชาชนต้องมี 13 หลัก',
    }),
  serviceDate: z.string()
    .regex(/^\d{2}-\d{2}-\d{4}$/, { message: 'รูปแบบวันที่ต้องเป็น dd-MM-yyyy' })
    .refine((val) => {
      const [dd, mm, yyyy] = val.split('-').map(Number);
      return yyyy >= 2500 && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31;
    }, { message: 'ปีต้องไม่น้อยกว่า 2500 และรูปแบบต้องถูกต้อง' }),
  requestType: z.enum([
    'รับส่งผู้ป่วย',
    'ปรึกษาแพทย์',
    'เยี่ยมบ้าน',
    'อื่น ๆ',
  ], { errorMap: () => ({ message: 'เลือกประเภทคำขอ' }) }),
  details: z.string().max(500, { message: 'รายละเอียดต้องไม่เกิน 500 ตัวอักษร' }).optional(),
});

export type NewRequestForm = z.infer<typeof NewRequestSchema>;
