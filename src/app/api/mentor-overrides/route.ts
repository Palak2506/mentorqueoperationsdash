import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const overrides = await prisma.mentorOverride.findMany();

    const record: Record<string, string> = {};
    for (const o of overrides) {
      record[o.candidateId] = o.mentorName;
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error fetching mentor overrides', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentor overrides' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, mentorName } = body ?? {};

    if (!candidateId || !mentorName) {
      return NextResponse.json(
        { error: 'candidateId and mentorName are required' },
        { status: 400 },
      );
    }

    const upserted = await prisma.mentorOverride.upsert({
      where: { candidateId },
      update: { mentorName },
      create: { candidateId, mentorName },
    });

    return NextResponse.json(upserted);
  } catch (error) {
    console.error('Error upserting mentor override', error);
    return NextResponse.json(
      { error: 'Failed to upsert mentor override' },
      { status: 500 },
    );
  }
}

