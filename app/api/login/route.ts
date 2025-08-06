import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { loginSchema } from '@/schemas/auth/login.schema';

const getJwtSecretKey = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT Secret key is not set in environment variables!');
    }
    return new TextEncoder().encode(secret);
};

export async function POST(request: Request) {
    console.log('[Login API] Received a login request.');
    try {
        console.log('[Login API] Step 1: Parsing request body...');
        const body = await request.json();
        console.log('[Login API] Step 1 successful.');

        console.log('[Login API] Step 2: Validating input schema...');
        // Overwriting existing validation to ensure robustness as per SA's final directive.
        const loginSchema = z.object({
            nationalId: z.string().length(13, { message: 'รหัสประชาชนต้องมี 13 หลัก' }),
            password: z.string().min(1, { message: 'กรุณาป้อนรหัสผ่าน' }),
        });

        const validation = loginSchema.safeParse(body);

        console.log(`[Login API] Step 2 validation success: ${validation.success}`);
        if (!validation.success) {
            return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง', details: validation.error.flatten() }, { status: 400 });
        }

        const { nationalId, password } = validation.data;


        console.log('[Login API] Step 3: Querying user from database...');
        const user = await prisma.user.findUnique({
            where: { nationalId },
        });

        console.log(`[Login API] Step 3 successful. User found: ${!!user}`);
        if (!user || !user.password) {
            return NextResponse.json({ error: 'รหัสประชาชนหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
        }

        if (!user.approved) {
            return NextResponse.json({ error: 'บัญชีของท่านยังไม่ได้รับการอนุมัติ' }, { status: 403 });
        }


        console.log('[Login API] Step 4: Comparing password...');
        const isPasswordValid = await bcrypt.compare(password, user.password);

        console.log(`[Login API] Step 4 successful. Password is valid: ${isPasswordValid}`);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'รหัสประชาชนหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
        }


        console.log('[Login API] Step 5: Generating JWT access token...');
        const accessToken = await new SignJWT({
            userId: user.id,
            role: user.role,
            name: `${user.firstName} ${user.lastName}`,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(getJwtSecretKey());

        const refreshToken = await new SignJWT({ userId: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(getJwtSecretKey());

        const response = NextResponse.json(
            {
                success: true,
                accessToken,
                user: {
                    id: user.id,
                    nationalId: user.nationalId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            },
            { status: 200 }
        );

        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        return response;

    } catch (error) {
        console.error('[API /api/login] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
