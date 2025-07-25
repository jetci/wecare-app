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
  serviceDate: z
    .string()
    .refine((val) => {
      const d = new Date(val);
      const today = new Date();
      // set time to midnight
      today.setHours(0, 0, 0, 0);
      return !isNaN(d.getTime()) && d >= today;
    }, { message: 'เลือกวันที่ปัจจุบันหรืออนาคตเท่านั้น' }),
  requestType: z.enum([
    'รับส่งผู้ป่วย',
    'ปรึกษาแพทย์',
    'เยี่ยมบ้าน',
    'อื่น ๆ',
  ], { errorMap: () => ({ message: 'เลือกประเภทคำขอ' }) }),
  details: z.string().max(500, { message: 'รายละเอียดต้องไม่เกิน 500 ตัวอักษร' }).optional(),
});

export type NewRequestForm = z.infer<typeof NewRequestSchema>;
