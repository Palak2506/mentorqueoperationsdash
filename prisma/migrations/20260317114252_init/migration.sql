-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "mentor" TEXT NOT NULL,
    "currentStageId" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'normal',
    "isAlumni" BOOLEAN NOT NULL DEFAULT false,
    "enrolledDate" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateAction" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "actionId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not-done',
    "date" TEXT,
    "comment" TEXT,

    CONSTRAINT "CandidateAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyItem" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "actionId" INTEGER,
    "stageId" TEXT,
    "shortTitle" TEXT NOT NULL,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not-done',
    "date" TEXT,
    "comment" TEXT,
    "poc" TEXT,
    "duration" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "JourneyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorOverride" (
    "candidateId" TEXT NOT NULL,
    "mentorName" TEXT NOT NULL,

    CONSTRAINT "MentorOverride_pkey" PRIMARY KEY ("candidateId")
);

-- CreateTable
CREATE TABLE "CandidateNote" (
    "candidateId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateNote_pkey" PRIMARY KEY ("candidateId")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "instanceId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "sessionTitle" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("instanceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "JourneyItem_instanceId_key" ON "JourneyItem"("instanceId");

-- AddForeignKey
ALTER TABLE "CandidateAction" ADD CONSTRAINT "CandidateAction_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyItem" ADD CONSTRAINT "JourneyItem_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorOverride" ADD CONSTRAINT "MentorOverride_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
