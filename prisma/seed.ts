import { PrismaClient } from '@prisma/client';
import { CANDIDATES, JOURNEY_ACTIONS } from '../src/lib/data';
import { loadJourney } from '../src/lib/session-store';

const prisma = new PrismaClient();

async function main() {
  // Build a lookup map for JOURNEY_ACTIONS keyed by actionId
  const actionLookup = new Map<number, any>();
  for (const action of JOURNEY_ACTIONS as any[]) {
    if (action && typeof action.actionId === 'number') {
      actionLookup.set(action.actionId, action);
    }
  }

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

      const actionMeta = actionLookup.get(action.actionId);

      const instanceId = `seed-${candidate.id}-${action.actionId}`;

      tx.push(
        prisma.journeyItem.upsert({
          where: { instanceId },
          update: {
            candidateId: candidate.id,
            actionId: action.actionId,
            stageId: actionMeta?.stageId ?? null,
            shortTitle: actionMeta?.shortTitle ?? action.shortTitle ?? '',
            title: actionMeta?.title ?? action.title ?? null,
            status: action.status ?? 'not-done',
            date: action.date ?? null,
            comment: action.comment ?? null,
            poc: action.poc ?? null,
            duration: action.duration ?? null,
            isCustom: action.isCustom ?? false,
            orderIndex: index,
          },
          create: {
            candidateId: candidate.id,
            instanceId,
            actionId: action.actionId,
            stageId: actionMeta?.stageId ?? null,
            shortTitle: actionMeta?.shortTitle ?? action.shortTitle ?? '',
            title: actionMeta?.title ?? action.title ?? null,
            status: action.status ?? 'not-done',
            date: action.date ?? null,
            comment: action.comment ?? null,
            poc: action.poc ?? null,
            duration: action.duration ?? null,
            isCustom: action.isCustom ?? false,
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

