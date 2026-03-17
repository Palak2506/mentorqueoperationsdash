import type { ActionStatus, Candidate, StageId } from "./data";
import { JOURNEY_ACTIONS } from "./data";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionItem {
  instanceId: string;
  actionId?: number;       // undefined for custom sessions
  title: string;
  shortTitle: string;
  duration?: string;
  poc?: string;
  stageId?: StageId | string;
  status: ActionStatus;
  date?: string;           // completion / scheduled date (display string)
  deadline?: string;       // ISO YYYY-MM-DD — used for overdue detection
  comment?: string;
  isCustom: boolean;
}

export type DeadlineStatus = "overdue" | "urgent" | "upcoming" | null;

// ─── Build / Load / Save ──────────────────────────────────────────────────────

export function buildInitialJourney(candidate: Candidate): SessionItem[] {
  const actionMap = new Map(candidate.actions.map((a) => [a.actionId, a]));
  return JOURNEY_ACTIONS.map((action) => {
    const ca = actionMap.get(action.id);
    return {
      instanceId: `action-${action.id}`,
      actionId: action.id,
      title: action.title,
      shortTitle: action.shortTitle,
      duration: action.duration,
      poc: action.poc,
      stageId: action.stageId,
      status: ca?.status ?? "not-done",
      date: ca?.date,
      deadline: undefined,
      comment: ca?.comment,
      isCustom: false,
    };
  });
}

const KEY = (id: string) => `mq-journey-v1-${id}`;

export function loadJourney(candidate: Candidate): SessionItem[] {
  if (typeof window === "undefined") return buildInitialJourney(candidate);
  try {
    const raw = localStorage.getItem(KEY(candidate.id));
    if (raw) return JSON.parse(raw) as SessionItem[];
  } catch {
    // ignore parse errors
  }
  return buildInitialJourney(candidate);
}

export function saveJourney(candidateId: string, journey: SessionItem[]): void {
  try {
    localStorage.setItem(KEY(candidateId), JSON.stringify(journey));
    window.dispatchEvent(new CustomEvent("mq:journey-updated", { detail: { candidateId } }));
  } catch {
    // ignore storage errors
  }
}

// ─── Deadline helpers ─────────────────────────────────────────────────────────

export function getDeadlineStatus(deadline?: string): DeadlineStatus {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "urgent";
  return "upcoming";
}

export function formatDeadline(deadline: string): string {
  const d = new Date(deadline);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function deadlineDaysLabel(deadline: string): string {
  const d = new Date(deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return "due today";
  if (diffDays === 1) return "due tomorrow";
  return `${diffDays}d left`;
}

// ─── Scheduled session helper ─────────────────────────────────────────────────

/** Returns true if the stored journey for this candidate has at least one scheduled session. */
export function hasScheduledSession(candidateId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(KEY(candidateId));
    if (!raw) return false;
    const journey = JSON.parse(raw) as SessionItem[];
    return journey.some((i) => i.status === "scheduled");
  } catch {
    return false;
  }
}

// ─── Progress helpers ─────────────────────────────────────────────────────────

export function journeyProgress(journey: SessionItem[]): number {
  const applicable = journey.filter((i) => i.status !== "na");
  if (applicable.length === 0) return 0;
  const done = applicable.filter((i) => i.status === "done").length;
  return Math.round((done / applicable.length) * 100);
}

// ─── Live candidate info (derived from localStorage journey) ─────────────────

export interface LiveCandidateInfo {
  progress: number;
  currentStageId: string;
  currentAction: SessionItem | null;
  doneCount: number;
  totalApplicable: number;
}

export function computeLiveCandidateInfo(candidate: Candidate): LiveCandidateInfo {
  return computeLiveInfoFromJourney(loadJourney(candidate), candidate);
}

export function computeLiveInfoFromJourney(journey: SessionItem[], candidate: Candidate): LiveCandidateInfo {
  const applicable = journey.filter((i) => i.status !== "na");
  const doneItems = applicable.filter((i) => i.status === "done");
  const progress = applicable.length === 0 ? 0 : Math.round((doneItems.length / applicable.length) * 100);
  const currentAction = journey.find((i) => i.status !== "done" && i.status !== "na") ?? null;

  let currentStageId: string = candidate.currentStageId;
  if (candidate.isAlumni) {
    currentStageId = "alumni";
  } else if (currentAction?.stageId) {
    currentStageId = currentAction.stageId;
  } else if (applicable.length > 0 && doneItems.length === applicable.length) {
    currentStageId = "alumni";
  }

  return { progress, currentStageId, currentAction, doneCount: doneItems.length, totalApplicable: applicable.length };
}
