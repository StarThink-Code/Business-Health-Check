import { resolveBusinessStatus } from "@bhc/shared";
import { STATUS_COLOR_TOKENS } from "./status-colors";

interface ProgressBarProps {
  /** 0-100 */
  value: number;
  label?: string;
  /**
   * "accent" for plain completion/progress (single hue).
   * "severity" colors the fill by score band, same mapping as StatusBadge —
   * for showing category scores where color-coding strengths/weaknesses helps.
   */
  variant?: "accent" | "severity";
}

export function ProgressBar({ value, label, variant = "accent" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const severity = variant === "severity" ? STATUS_COLOR_TOKENS[resolveBusinessStatus(clamped).status] : null;

  return (
    <div>
      {label && (
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="text-ink-secondary">{label}</span>
          <span className="font-semibold text-ink">{Math.round(clamped)}%</span>
        </div>
      )}
      <div
        className={`h-2 w-full overflow-hidden rounded-full ${severity ? severity.tint : "bg-accent-tint"}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-[width] ${severity ? severity.fill : "bg-accent"}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
