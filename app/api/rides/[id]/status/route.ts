import { NextResponse } from 'next/server'
import { PrismaClient, RideStatus } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// simple UUID v4 regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ success: false, code: 'INVALID_RIDE_ID', message: 'Invalid ride ID format' }, { status: 400 })
  }
  const authRes = await verifyToken(req)
  if (authRes instanceof NextResponse) return authRes
  const { userId, role } = authRes
  if (role !== 'DRIVER') {
    return NextResponse.json({ success: false, code: 'FORBIDDEN', message: 'Driver only' }, { status: 403 })
  }

  let body: { status?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }
  const { status } = body
  const allowedStatuses: Record<RideStatus, RideStatus[]> = {
    PENDING: ['ACCEPTED', 'CANCELLED'],
    ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: []
  }
  if (!status || !Object.values(RideStatus).includes(status as RideStatus)) {
    return NextResponse.json({ success: false, code: 'INVALID_STATUS', message: 'Invalid status value' }, { status: 400 })
  }

  const ride = await prisma.ride.findUnique({ where: { id } })
  if (!ride) {
    return NextResponse.json({ success: false, error: 'Ride not found' }, { status: 404 })
  }
  if (ride.driverId !== userId) {
    return NextResponse.json({ success: false, code: 'FORBIDDEN', message: 'Not ride driver' }, { status: 403 })
  }
  const current = ride.status as RideStatus
  const next = status as RideStatus
  if (!allowedStatuses[current].includes(next)) {
    return NextResponse.json({ success: false, code: 'INVALID_TRANSITION', message: `Cannot transition from ${current} to ${next}` }, { status: 400 })
  }

  try {
    const updated = await prisma.ride.update({
      where: { id },
      data: { status: next }
    })
    return NextResponse.json({ success: true, ride: updated })
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
