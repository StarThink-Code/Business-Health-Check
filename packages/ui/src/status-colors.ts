import type { BusinessStatus } from "@bhc/shared";

/** Shared between StatusBadge and Meter so a given score always reads as the same color. */
export const STATUS_COLOR_TOKENS: Record<BusinessStatus, { text: string; tint: string; fill: string }> = {
  strong_performer: { text: "text-good", tint: "bg-good-tint", fill: "bg-good" },
  on_the_right_track: { text: "text-warning", tint: "bg-warning-tint", fill: "bg-warning" },
  just_getting_started: { text: "text-critical", tint: "bg-critical-tint", fill: "bg-critical" },
};
