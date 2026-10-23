import type { StoryStatus } from "@/integrations/alpha-supabase/types";

export type { StoryStatus };
export type StoryAction = "publish" | "decline" | "restore" | "hide" | "show" | "delete";

export const STATUS_LABEL: Record<StoryStatus, string> = {
  waiting: "Waiting",
  live: "Live",
  hidden: "Hidden",
  declined: "Declined",
};

const ACTIONS: Record<StoryStatus, StoryAction[]> = {
  waiting: ["publish", "decline"],
  live: ["hide"],
  hidden: ["show", "delete"],
  declined: ["restore", "delete"],
};

export function actionsFor(status: StoryStatus): StoryAction[] {
  return [...ACTIONS[status]];
}

type Move = { from: StoryStatus; to: StoryStatus };

const TRANSITIONS: Record<Exclude<StoryAction, "delete">, Move> = {
  publish: { from: "waiting", to: "live" },
  decline: { from: "waiting", to: "declined" },
  restore: { from: "declined", to: "waiting" },
  hide: { from: "live", to: "hidden" },
  show: { from: "hidden", to: "live" },
};

export function transition(action: Exclude<StoryAction, "delete">): Move {
  return { ...TRANSITIONS[action] };
}

export function needsConsentRecord(action: StoryAction): boolean {
  return action === "publish";
}

export const UNDO: Record<"publish" | "decline" | "hide" | "show" | "restore", Move> = {
  publish: { from: "live", to: "waiting" },
  decline: { from: "declined", to: "waiting" },
  hide: { from: "hidden", to: "live" },
  show: { from: "live", to: "hidden" },
  restore: { from: "waiting", to: "declined" },
};
