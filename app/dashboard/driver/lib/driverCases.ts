import { z } from 'zod';

// Schema for weekly summary
export const weeklySummarySchema = z.array(
  z.object({
    date: z.string(),
    approved: z.number(),
    pending: z.number(),
    canceled: z.number(),
  })
);
export type WeeklySummary = z.infer<typeof weeklySummarySchema>;

// Schema for cases by day
export const casesByDaySchema = z.record(
  z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      status: z.enum(['pending', 'accepted', 'in_progress', 'completed', 'cancelled']),
      time: z.string(),
      location: z.string(),
    })
  )
);

export type CasesByDay = z.infer<typeof casesByDaySchema>;

// Schema and fetcher for driver schedule (weekly calendar)
export const driverScheduleSchema = casesByDaySchema;
export type DriverScheduleByDate = z.infer<typeof driverScheduleSchema>;

export async function fetchDriverSchedule(
  url: string
): Promise<DriverScheduleByDate> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch driver schedule');
  const data = await res.json();
  return driverScheduleSchema.parse(data);
}
// Fetcher for weekly summary
export async function fetchWeeklySummary(): Promise<WeeklySummary> {
  const res = await fetch('/api/driver/cases/weekly-summary', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch weekly summary');
  const data = await res.json();
  return weeklySummarySchema.parse(data);
}

// Fetcher for cases by day
export async function fetchCasesByDay(
  week: string = 'current'
): Promise<CasesByDay> {
  const res = await fetch(`/api/driver/cases/by-day?week=${week}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch cases by day');
  const data = await res.json();
  return casesByDaySchema.parse(data);
}
