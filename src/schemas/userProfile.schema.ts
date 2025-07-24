import { z } from 'zod';

// Schema for editing system user profile (Dashboard users)
export const UserProfileSchema = z.object({
  fullName: z.string().min(1, { message: 'กรุณากรอกชื่อ-นามสกุล' }),
  email: z.string().email({ message: 'อีเมลไม่ถูกต้อง' }),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{9,10}$/.test(val), {
      message: 'เบอร์โทรศัพท์ไม่ถูกต้อง',
    }),
  nationalId: z
    .string()
    .length(13, { message: 'เลขบัตรประชาชนต้องมี 13 หลัก' }),
  birthDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'วันเกิดไม่ถูกต้อง',
    }),
  avatarFile: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size < 5 * 1024 * 1024, {
      message: 'ไฟล์ avatar ต้องมีขนาดน้อยกว่า 5MB',
    }),
});

export type UserProfileForm = z.infer<typeof UserProfileSchema>;
