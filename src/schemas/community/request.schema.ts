import { z } from 'zod';

// Zod Schema สำหรับตรวจสอบข้อมูลในฟอร์มสร้างคำขอ
export const requestFormSchema = z.object({
  patientId: z.string().uuid().optional(),
  type: z.string().min(1, 'กรุณาเลือกประเภทบริการ'),
  title: z.string().min(5, 'หัวข้อต้องมีอย่างน้อย 5 ตัวอักษร').max(100, 'หัวข้อต้องไม่เกิน 100 ตัวอักษร'),
  description: z.string().max(500, 'รายละเอียดต้องไม่เกิน 500 ตัวอักษร').optional(),
});

export type RequestFormData = z.infer<typeof requestFormSchema>;
