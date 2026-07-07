import type { ReactElement } from "react";
import type { BusinessStatus } from "@bhc/shared";

interface StatusStyle {
  text: string;
  tint: string;
  icon: "check" | "dot" | "warning" | "cross";
}

const STATUS_STYLES: Record<BusinessStatus, StatusStyle> = {
  excellent: { text: "text-good", tint: "bg-good-tint", icon: "check" },
  very_good: { text: "text-good", tint: "bg-good-tint", icon: "dot" },
  good: { text: "text-warning", tint: "bg-warning-tint", icon: "dot" },
  needs_improvement: { text: "text-serious", tint: "bg-serious-tint", icon: "warning" },
  critical: { text: "text-critical", tint: "bg-critical-tint", icon: "cross" },
};

const ICONS: Record<StatusStyle["icon"], ReactElement> = {
  check: (
    <path d="M4.5 8.5l2.5 2.5 4.5-5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  dot: <circle cx="8" cy="8" r="2.5" />,
  warning: (
    <path
      d="M8 5.5v3.25M8 11h.007M7.14 2.6L1.7 12.2c-.4.7.1 1.55.9 1.55h10.8c.8 0 1.3-.85.9-1.55L8.86 2.6a1 1 0 00-1.72 0z"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  cross: (
    <path d="M5.5 5.5l5 5m0-5l-5 5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

export function StatusBadge({ status, label }: { status: BusinessStatus; label: string }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${style.text} ${style.tint}`}
    >
      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" stroke="currentColor" aria-hidden>
        {ICONS[style.icon]}
      </svg>
      {label}
    </span>
  );
}
