import { z } from 'zod';

const isValidNationalId = (id: string) => {
  if (id.length !== 13 || !/^[0-9]+$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i), 10) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(id.charAt(12), 10);
};

export const loginSchema = z.object({
  nationalId: z.string()
    .length(13, 'รหัสประชาชนต้องมี 13 หลัก')
    .refine(isValidNationalId, { message: 'รหัสประชาชนไม่ถูกต้อง' }),
  password: z.string().min(1, 'กรุณาระบุรหัสผ่าน'),
});

export type LoginInput = z.infer<typeof loginSchema>;
