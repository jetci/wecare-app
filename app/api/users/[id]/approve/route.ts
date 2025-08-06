import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifyAuth(req);
    if (session instanceof NextResponse) {
      return session;
    }
    if (session.role !== Role.ADMIN) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    const userToApprove = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToApprove) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (userToApprove.approved) {
      return NextResponse.json({ message: 'User is already approved' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { approved: true },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('PUT /api/users/[id]/approve Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
