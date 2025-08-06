import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/schemas/auth/register.schema';
import { Role, Position } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง', details: validation.error.flatten() }, { status: 400 });
        }

        const { nationalId, password, ...rest } = validation.data;

        const existingUser = await prisma.user.findUnique({
            where: { nationalId },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'รหัสประชาชนนี้ถูกใช้งานแล้ว' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                ...rest,
                nationalId,
                password: hashedPassword,
                role: Role.COMMUNITY, // Default role for new users
                position: Position.COMMUNITY, // Default position for new users
                approved: false, // New users require approval by default
            },
            select: { // Return only safe data
                id: true,
                firstName: true,
                lastName: true,
                nationalId: true,
                role: true,
                approved: true,
            }
        });

        return NextResponse.json(newUser, { status: 201 });

    } catch (error) {
        console.error('[API /api/register] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
