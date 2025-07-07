import { z } from "zod";

// Query schema for GET /api/driver/cases
export const DriverCasesQuerySchema = z.object({
  driverId: z.string().uuid(),
});

// Driver case item
export const DriverCaseSchema = z.object({
  id: z.string().uuid(),
  driverId: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "completed"]),
  priority: z.enum(["low", "normal", "high"]),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  timestamp: z.string(),
});

// Response for GET /api/driver/cases
export const GetDriverCasesResponseSchema = z.array(DriverCaseSchema);

// Params schema for POST /api/driver/cases/:id/accept and complete
export const ModifyDriverCaseParamsSchema = z.object({
  id: z.string().uuid(),
});

// Response for POST accept/complete, return updated case
export const ModifyDriverCaseResponseSchema = DriverCaseSchema;
