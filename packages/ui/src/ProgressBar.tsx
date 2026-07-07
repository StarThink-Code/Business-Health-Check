interface ProgressBarProps {
  /** 0-100 */
  value: number;
  label?: string;
  colorClassName?: string;
}

export function ProgressBar({ value, label, colorClassName = "bg-indigo-600" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`h-full rounded-full ${colorClassName}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
