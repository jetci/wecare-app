import { z } from 'zod';

export const createNotificationSchema = z.object({
  targetUserId: z.string().uuid({ message: 'Invalid user ID format' }),
  type: z.string().min(1, { message: 'Type is required' }),
  message: z.string().min(1, { message: 'Message is required' }),
});
