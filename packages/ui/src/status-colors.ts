import type { BusinessStatus } from "@bhc/shared";

/** Shared between StatusBadge and Meter so a given score always reads as the same color. */
export const STATUS_COLOR_TOKENS: Record<BusinessStatus, { text: string; tint: string; fill: string }> = {
  excellent: { text: "text-good", tint: "bg-good-tint", fill: "bg-good" },
  very_good: { text: "text-good", tint: "bg-good-tint", fill: "bg-good" },
  good: { text: "text-warning", tint: "bg-warning-tint", fill: "bg-warning" },
  needs_improvement: { text: "text-serious", tint: "bg-serious-tint", fill: "bg-serious" },
  critical: { text: "text-critical", tint: "bg-critical-tint", fill: "bg-critical" },
};
