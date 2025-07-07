import { z } from 'zod';

// Schema สำหรับ query parameter ?area=
export const officerQuerySchema = z.object({
  area: z.string().optional(),
});

// Schema สำหรับ route params /appointments/[id]
export const appointmentParamsSchema = z.object({
  id: z.string().uuid(),
});
