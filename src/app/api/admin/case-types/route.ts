import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    const types = await prisma.caseType.findMany();
    return NextResponse.json(types, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/case-types error', error);
    return NextResponse.json({ error: 'Failed to fetch case types' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    const created = await prisma.caseType.create({ data: { name } });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/case-types error', error);
    return NextResponse.json({ error: 'Failed to create case type' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name } = await req.json();
    const updated = await prisma.caseType.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT /api/admin/case-types error', error);
    return NextResponse.json({ error: 'Failed to update case type' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.caseType.delete({ where: { id } });
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/admin/case-types error', error);
    return NextResponse.json({ error: 'Failed to delete case type' }, { status: 500 });
  }
}
