import { PrismaClient } from '@prisma/client';
import { CANDIDATES, JOURNEY_ACTIONS } from '../src/lib/data';
import { loadJourney } from '../src/lib/session-store';

const prisma = new PrismaClient();

async function main() {
  const tx: any[] = [];

  for (const candidate of CANDIDATES as any[]) {
    if (!candidate?.id) continue;

    // Upsert Candidate
    tx.push(
      prisma.candidate.upsert({
        where: { id: candidate.id },
        update: {
          name: candidate.name,
          role: candidate.role,
          mentor: candidate.mentor,
          currentStageId: candidate.currentStageId,
          riskLevel: candidate.riskLevel ?? 'normal',
          isAlumni: candidate.isAlumni ?? false,
          enrolledDate: candidate.enrolledDate,
          notes: candidate.notes ?? null,
        },
        create: {
          id: candidate.id,
          name: candidate.name,
          role: candidate.role,
          mentor: candidate.mentor,
          currentStageId: candidate.currentStageId,
          riskLevel: candidate.riskLevel ?? 'normal',
          isAlumni: candidate.isAlumni ?? false,
          enrolledDate: candidate.enrolledDate,
          notes: candidate.notes ?? null,
        },
      })
    );

    const actions = (candidate as any).actions ?? [];

    actions.forEach((action: any, index: number) => {
      if (action == null || typeof action.actionId !== 'number') return;

      const ja = JOURNEY_ACTIONS.find((j) => j.id === action.actionId);

      const instanceId = `seed-${candidate.id}-${action.actionId}`;

      tx.push(
        prisma.journeyItem.upsert({
          where: { instanceId },
          update: {
            instanceId: `seed-${candidate.id}-${action.actionId}`,
            candidateId: candidate.id,
            actionId: action.actionId,
            stageId: ja?.stageId ?? null,
            shortTitle: ja?.shortTitle ?? '',
            title: ja?.title ?? '',
            status: action.status,
            date: action.date ?? null,
            comment: action.comment ?? null,
            poc: ja?.poc ?? null,
            duration: ja?.duration ?? null,
            isCustom: false,
            orderIndex: index,
          },
          create: {
            instanceId: `seed-${candidate.id}-${action.actionId}`,
            candidateId: candidate.id,
            actionId: action.actionId,
            stageId: ja?.stageId ?? null,
            shortTitle: ja?.shortTitle ?? '',
            title: ja?.title ?? '',
            status: action.status,
            date: action.date ?? null,
            comment: action.comment ?? null,
            poc: ja?.poc ?? null,
            duration: ja?.duration ?? null,
            isCustom: false,
            orderIndex: index,
          },
        })
      );
    });
  }

  if (tx.length > 0) {
    await prisma.$transaction(tx);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

