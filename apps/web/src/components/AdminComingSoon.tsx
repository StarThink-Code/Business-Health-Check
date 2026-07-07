import { Card } from "@bhc/ui";
import { AdminShell } from "./AdminShell";

export function AdminComingSoon({ title }: { title: string }) {
  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-ink">{title}</h1>
      <Card>
        <p className="text-ink-secondary">
          This section isn't built yet — the route and nav entry are wired up so it's ready to implement
          next.
        </p>
      </Card>
    </AdminShell>
  );
}
