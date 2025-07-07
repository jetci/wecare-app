import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  // Auth guard for GET
  const token = req.cookies.get('accessToken')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Placeholder Notifications API
  const notifications: { id: string; message: string }[] = [];
  return NextResponse.json(notifications);
}

// Broadcast endpoint with validation and auth
export async function POST(req: NextRequest) {
  // Auth guard
  const token = req.cookies.get('accessToken')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const BroadcastSchema = z.object({ message: z.string().min(1, 'Message cannot be empty').max(500, 'Message too long') });
  type BroadcastInput = z.infer<typeof BroadcastSchema>;
  let data: unknown;
  try {
    data = await req.json();
    const input: BroadcastInput = BroadcastSchema.parse(data);
    console.log('Broadcast message:', input.message);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid payload';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  // TODO: integrate with real notification service
  return NextResponse.json({ success: true });
}