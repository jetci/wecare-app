import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyToken } from '@/lib/auth'
import { randomUUID } from 'crypto'

import { mockRides } from './mocks'

// in-memory mock data


// schema
const rideSchema = z.object({ patientId: z.string().uuid(), date: z.string().refine(d => { const t = Date.parse(d); return !isNaN(t) && t > Date.now() }, { message: 'Invalid date' }) })

export async function GET(req: Request) {
  const auth = await verifyToken(req)
  if (auth instanceof NextResponse) return auth
  return NextResponse.json({ success: true, rides: mockRides })
}

export async function POST(req: Request) {
  const auth = await verifyToken(req)
  if (auth instanceof NextResponse) return auth
  const parsed = await req.json().catch(() => null)
  const result = rideSchema.safeParse(parsed)
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error.flatten() }, { status: 400 })
  }
  const { patientId, date } = result.data
  const ride = { id: randomUUID(), patientId, date, status: 'PENDING' }
  mockRides.push(ride)
  return NextResponse.json({ success: true, ride }, { status: 201 })
}
