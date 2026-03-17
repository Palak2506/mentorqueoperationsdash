import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id: candidateId } = params;

  try {
    const note = await prisma.candidateNote.findUnique({
      where: { candidateId },
    });

    return NextResponse.json({
      candidateId,
      content: note?.content ?? '',
      updatedAt: note?.updatedAt ?? null,
    });
  } catch (error) {
    console.error('Error fetching candidate note', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidate note' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id: candidateId } = params;

  try {
    const body = await request.json();
    const { content } = body ?? {};

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'content must be a string' },
        { status: 400 },
      );
    }

    const note = await prisma.candidateNote.upsert({
      where: { candidateId },
      update: { content },
      create: { candidateId, content },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error upserting candidate note', error);
    return NextResponse.json(
      { error: 'Failed to upsert candidate note' },
      { status: 500 },
    );
  }
}

