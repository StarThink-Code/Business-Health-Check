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
      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm transition-colors ${
        checked
          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
          : "border-slate-200 hover:border-slate-300 dark:border-slate-800"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-600"
      />
      <span className="text-slate-900 dark:text-slate-100">{label}</span>
    </label>
  );
}
