/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { optedOut } = await req.json();
    await prisma.$executeRaw`
      UPDATE "Candidate" 
      SET "optedOut" = ${Boolean(optedOut)}
      WHERE id = ${params.id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('opted-out error:', error);
    return NextResponse.json(
      { error: 'Failed to update opted-out status' },
      { status: 500 },
    );
  }
}


