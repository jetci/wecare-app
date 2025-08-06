import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UpdateUserRoleSchema } from '@/schemas/community/user.schema';
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
    const body = await req.json();

    const validation = UpdateUserRoleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.format() }, { status: 400 });
    }

    const userToUpdate = await prisma.user.findUnique({ where: { id } });

    if (!userToUpdate) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('PUT /api/users/[id]/role Error:', error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ errors: error.format() }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
