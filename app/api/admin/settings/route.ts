import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.threshold.findMany();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/settings error', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, value, unit } = await req.json();
    const created = await prisma.threshold.create({ data: { key, value, unit } });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/settings error', error);
    return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { key, value, unit } = await req.json();
    const updated = await prisma.threshold.update({ where: { key }, data: { value, unit } });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT /api/admin/settings error', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { key } = await req.json();
    await prisma.threshold.delete({ where: { key } });
    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/admin/settings error', error);
    return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 });
  }
}
