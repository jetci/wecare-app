import prisma from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const areas = await prisma.area.findMany({ where: { active: true } });
    return NextResponse.json(areas, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/areas error', error);
    return NextResponse.json({ error: 'Failed to fetch areas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { province, district, subdistrict } = await req.json();
    console.log('[POST Area] BODY:', { province, district, subdistrict });
    const created = await prisma.area.create({
      data: {
        province,
        district,
        subdistrict: subdistrict ?? '',
      }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/areas error', error);
    return NextResponse.json({ error: 'Failed to create area' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, province, district, subdistrict, active } = await req.json();
    console.log('[PUT Area] BODY:', { id, province, district, subdistrict, active });
    const updated = await prisma.area.update({
      where: { id },
      data: {
        province,
        district,
        subdistrict: subdistrict ?? '',
        active,
      }
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT /api/admin/areas error', error);
    return NextResponse.json({ error: 'Failed to update area' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.area.delete({ where: { id } });
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/admin/areas error', error);
    return NextResponse.json({ error: 'Failed to delete area' }, { status: 500 });
  }
}
