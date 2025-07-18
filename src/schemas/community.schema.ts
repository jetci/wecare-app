import { z } from 'zod';

// Query schema for GET /api/community/requests and /api/community/history
export const CommunityRequestsQuerySchema = z.object({
  nationalId: z.string().length(13).optional(),
});

// Community request item
export const CommunityRequestSchema = z.object({
  id: z.string().uuid(),
  nationalId: z.string(),
  type: z.string(),
  status: z.string(),
  details: z.string().optional(),
  createdAt: z.string(),
});

// Responses
export const GetCommunityRequestsResponseSchema = z.array(CommunityRequestSchema);
export const GetCommunityHistoryResponseSchema = z.array(CommunityRequestSchema);

// Body schema for POST /api/community/requests
export const CreateCommunityRequestBodySchema = z.object({
  nationalId: z.string().length(13),
  type: z.string(),
  details: z.string().optional(),
});

export const CreateCommunityRequestResponseSchema = CommunityRequestSchema;

// TypeScript type for community request
export type CommunityRequest = z.infer<typeof CommunityRequestSchema>;
