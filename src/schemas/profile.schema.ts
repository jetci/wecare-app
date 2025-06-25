import * as z from "zod";

/**
 * Zod schema for profile form validation
 */
export const ProfileFormSchema = z
  .object({
    firstName: z.string().min(1, "กรุณาระบุชื่อ"),
    lastName: z.string().min(1, "กรุณาระบุนามสกุล"),
    nationalId: z
      .string()
      .regex(/^[0-9]{13}$/, "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก"),
    houseNumber: z.string().min(1, "กรุณาระบุบ้านเลขที่"),
    village: z.enum([
      "หมู่ 1", "หมู่ 2", "หมู่ 3", "หมู่ 4", "หมู่ 5", "หมู่ 6", "หมู่ 7", "หมู่ 8", "หมู่ 9", "หมู่ 10",
      "หมู่ 11", "หมู่ 12", "หมู่ 13", "หมู่ 14", "หมู่ 15", "หมู่ 16", "หมู่ 17", "หมู่ 18", "หมู่ 19", "หมู่ 20",
    ], { errorMap: () => ({ message: "กรุณาเลือกหมู่ที่" }) }),
    subDistrict: z.string().min(1, "กรุณาระบุตำบล"),
    district: z.string().min(1, "กรุณาระบุอำเภอ"),
    province: z.string().min(1, "กรุณาระบุจังหวัด"),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "เบอร์โทรต้องเป็นตัวเลข 10 หลัก"),
    newPassword: z
      .string()
      .min(6, "รหัสผ่านต้องอย่างน้อย 6 ตัว")
      .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])/, "รหัสผ่านต้องมีตัวเลขและอักขระพิเศษ")
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export type ProfileForm = z.infer<typeof ProfileFormSchema>;
