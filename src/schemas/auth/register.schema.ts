import { z } from 'zod';

export const registerSchema = z.object({
  prefix: z.string().min(1, 'กรุณาระบุคำนำหน้าชื่อ'),
  firstName: z.string().min(1, 'กรุณาระบุชื่อจริง'),
  lastName: z.string().min(1, 'กรุณาระบุนามสกุล'),
  nationalId: z.string().length(13, 'รหัสประชาชนต้องมี 13 หลัก'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  phone: z.string().optional(),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  // Assuming role and position are assigned by admin later
});

export type RegisterInput = z.infer<typeof registerSchema>;
