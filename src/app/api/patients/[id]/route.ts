import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { patientSchema } from '../route'

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

// GET /api/patients/:id
export async function GET(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  if (!uuidRegex.test(id)) return NextResponse.json({ error: 'Invalid id format' }, { status: 400 })
  const auth = await verifyToken(req)
  if (auth instanceof NextResponse) return auth
  try {
    const patient = await prisma.patient.findUnique({ where: { id } })
    if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, patient }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// PUT /api/patients/:id
export async function PUT(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: 'Invalid id format' }, { status: 400 })
  }
  const auth = await verifyToken(req)
  if (auth instanceof NextResponse) return auth

  let data: any
  try { data = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const result = patientSchema.partial().safeParse(data)
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 })

  const pd = result.data
  try {
    const updated = await prisma.patient.update({
      where: { id },
      data: pd
    })
    return NextResponse.json({ success: true, patient: updated }, { status: 200 })
  } catch (err: any) {
    if (err.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// DELETE /api/patients/:id
export async function DELETE(req: NextRequest, { params: { id } }: { params: { id: string } }) {
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: 'Invalid id format' }, { status: 400 })
  }
  const auth = await verifyToken(req)
  if (auth instanceof NextResponse) return auth
  try {
    await prisma.patient.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err: any) {
    if (err.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

