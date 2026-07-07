interface RadioCardProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (value: string) => void;
}

export function RadioCard({ name, value, label, checked, onChange }: RadioCardProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition-colors ${
        checked ? "border-accent bg-accent-tint" : "border-border hover:border-border-strong"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? "border-accent" : "border-border-strong"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-accent" />}
      </span>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span className="text-ink">{label}</span>
    </label>
  );
}
