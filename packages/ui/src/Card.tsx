import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(11,11,11,0.04),0_8px_24px_-12px_rgba(11,11,11,0.08)] sm:p-8 ${className}`}
      {...props}
    />
  );
}
