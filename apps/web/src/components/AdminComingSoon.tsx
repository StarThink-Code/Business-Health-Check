import { Card } from "@bhc/ui";
import { AdminShell } from "./AdminShell";

export function AdminComingSoon({ title }: { title: string }) {
  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
      <Card>
        <p className="text-slate-600 dark:text-slate-400">
          This section isn't built yet — the route and nav entry are wired up so it's ready to
          implement next.
        </p>
      </Card>
    </AdminShell>
  );
}
