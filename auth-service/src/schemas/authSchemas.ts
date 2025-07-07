// src/schemas/authSchemas.ts
import { z } from 'zod';

// 1. Login Request
export const loginRequestSchema = z.object({
  nationalId: z.string().length(13, 'รหัส 13 หลักเท่านั้น'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

// 2. Login Response
export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string(),
    role: z.enum(['COMMUNITY', 'DRIVER', 'HEALTH_OFFICER', 'EXECUTIVE', 'ADMIN']),
  }),
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

// 3. Profile Response
export const profileResponseSchema = z.object({
  id: z.string(),
  prefix: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  nationalId: z.string().length(13),
  phone: z.string().nullable(),
  role: z.enum(['COMMUNITY', 'DRIVER', 'HEALTH_OFFICER', 'EXECUTIVE', 'ADMIN']),
  approved: z.boolean(),
});
export type ProfileResponse = z.infer<typeof profileResponseSchema>;

// 4. Error Response
export const errorResponseSchema = z.object({
  error: z.string(),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
