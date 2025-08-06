import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { patientFormSchema } from '@/schemas/community/patient.schema';

interface RouteParams {
    params: { id: string };
}

// PUT handler for updating a patient
export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await verifyAuth(req);
        if (session instanceof NextResponse) {
            return session; // Unauthorized
        }

        const { id } = params;
        const patient = await prisma.patient.findUnique({
            where: { id },
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        // RBAC: COMMUNITY can only edit their own patients
        if (session.role === 'COMMUNITY' && patient.managedByUserId !== session.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const validation = patientFormSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
        }

        const updatedPatient = await prisma.patient.update({
            where: { id },
            data: validation.data,
        });

        return NextResponse.json(updatedPatient);

    } catch (error) {
        console.error(`Error updating patient ${params.id}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE handler for deleting a patient
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await verifyAuth(req);
        if (session instanceof NextResponse) {
            return session; // Unauthorized
        }

        const { id } = params;
        const patient = await prisma.patient.findUnique({
            where: { id },
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        // RBAC: COMMUNITY can only delete their own patients
        if (session.role === 'COMMUNITY' && patient.managedByUserId !== session.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.patient.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: 'Patient deleted successfully' });

    } catch (error) {
        console.error(`Error deleting patient ${params.id}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
