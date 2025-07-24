import * as z from "zod";
import { isValidThaiID } from '@/schemas/community/patient.schema';

/**
 * Zod schema for profile form validation
 */
export const ProfileFormSchema = z.object({
  fullName: z.string().min(2, 'กรุณากรอกชื่อ-สกุลอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  phone: z.string().regex(/^\d{10}$/, 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก'),
  nationalId: z.string()
    .refine(val => isValidThaiID(val.replace(/[-\s]/g, '')), { message: 'เลขบัตรประชาชนไม่ถูกต้อง' }),
  birthDate: z.string()
    .refine(val => new Date(val) < new Date(), { message: 'วันที่ต้องเป็นอดีต' }),
  avatarFile: z
    .any()
    .optional()
    .refine((file: unknown) => {
      if (!file) return true;
      return ['image/jpeg', 'image/png'].includes((file as File).type);
    }, { message: 'ไฟล์ต้องเป็นภาพ JPG หรือ PNG' }),
});

export type ProfileForm = z.infer<typeof ProfileFormSchema>;
