import { z } from 'zod';
import { Role } from '@prisma/client';

export const userFormSchema = z.object({
  firstName: z.string().min(1, 'กรุณากรอกชื่อจริง'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  nationalId: z.string().length(13, 'รหัสประจำตัวประชาชนต้องมี 13 หลัก'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  confirmPassword: z.string(),
  role: z.nativeEnum(Role, { errorMap: () => ({ message: 'กรุณาเลือกบทบาท' }) }),
  approved: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

export type UserFormData = z.infer<typeof userFormSchema>;
