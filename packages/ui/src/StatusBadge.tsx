import type { BusinessStatus } from "@bhc/shared";

const STATUS_CLASSES: Record<BusinessStatus, string> = {
  excellent: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  very_good: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
  good: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  needs_improvement: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function StatusBadge({ status, label }: { status: BusinessStatus; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_CLASSES[status]}`}
    >
      {label}
    </span>
  );
}
