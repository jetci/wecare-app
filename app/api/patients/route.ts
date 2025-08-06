import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { patientFormSchema } from '@/schemas/community/patient.schema';
import { verifyAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const session = await verifyAuth(req);
        if (session instanceof NextResponse) {
            return session; // Return the error response directly
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        let where: Prisma.PatientWhereInput = {};

        // RBAC: Filter by managedByUserId for COMMUNITY role
        if (session.role === 'COMMUNITY') {
            where.managedByUserId = session.userId;
        }

        // Search functionality
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { nationalId: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [patients, total] = await prisma.$transaction([
            prisma.patient.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.patient.count({ where }),
        ]);

        return NextResponse.json({
            data: patients,
            meta: {
                total,
                totalPages: Math.ceil(total / limit),
                page,
                limit,
            },
        });

    } catch (error) {
        console.error('Error fetching patients:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await verifyAuth(req);
        if (session instanceof NextResponse) {
            return session; // Return the error response directly
        }

        // Now, session is guaranteed to be AuthSession
        if (session.role !== 'COMMUNITY') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const validation = patientFormSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
        }

        const data = validation.data;

        const newPatient = await prisma.patient.create({
            data: {
                ...data,
                managedByUserId: session.userId,
                // The schema now expects these fields, let's provide them
                idCardAddress_tambon: data.idCardAddress_tambon,
                idCardAddress_amphoe: data.idCardAddress_amphoe,
                idCardAddress_changwat: data.idCardAddress_changwat,
            }
        });

        return NextResponse.json(newPatient, { status: 201 });

    } catch (error) {
        console.error('Error creating patient:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
