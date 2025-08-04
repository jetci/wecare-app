import { z } from 'zod';

export const LoginSchema = z.object({
  nationalId: z.string().min(1, { message: 'กรุณากรอกรหัสประชาชน' }),
  password: z.string().min(1, { message: 'กรุณากรอกรหัสผ่าน' }),
});
