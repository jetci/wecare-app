import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

/**
 * Placeholder Admin Notifications API
 * Returns an array of notification objects for admin
 */
export async function GET() {
  try {
    const templates = await prisma.notificationTemplate.findMany()
    return NextResponse.json(templates, { status: 200 })
  } catch (error) {
    console.error('GET /api/admin/notifications error', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, message } = await req.json()
    const created = await prisma.notificationTemplate.create({ data: { key, message } })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/notifications error', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, message } = await req.json()
    const updated = await prisma.notificationTemplate.update({
      where: { id },
      data: { message },
    })
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('PUT /api/admin/notifications error', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    await prisma.notificationTemplate.delete({ where: { id } })
    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/admin/notifications error', error)
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
  }
}
