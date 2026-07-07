import type { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: ReactNode;
  /** Tailwind text-color class applied to the value only (e.g. a status color). */
  valueClassName?: string;
  children?: ReactNode;
}

/** A single hero figure — the one number a view leads with. */
export function StatTile({ label, value, valueClassName = "text-ink", children }: StatTileProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="eyebrow">{label}</p>
      <p className={`text-6xl font-bold sm:text-7xl ${valueClassName}`}>{value}</p>
      {children}
    </div>
  );
}
