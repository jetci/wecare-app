import { z } from 'zod';
import { Role, Position } from '@prisma/client';

export const GetUsersSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  }),
});

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  nationalId: z.string(),
  role: z.nativeEnum(Role),
  position: z.nativeEnum(Position),
  approved: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UsersResponseSchema = z.object({
  users: z.array(UserProfileSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export const UpdateUserRoleSchema = z.object({
  role: z.nativeEnum(Role).optional(),
  position: z.nativeEnum(Position).optional(),
}).refine(data => data.role || data.position, {
  message: 'Either role or position must be provided',
});

