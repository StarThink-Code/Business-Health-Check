import { useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { adminAuth } from "../lib/admin-auth";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/questions", label: "Questions" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/recommendations", label: "Recommendations" },
  { to: "/admin/assessments", label: "Assessment History" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/users", label: "Admin Users" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) {
      navigate({ to: "/admin/login" });
    }
  }, [navigate]);

  if (!adminAuth.isAuthenticated()) return null;

  return (
    <div className="flex min-h-screen bg-page">
      <aside className="w-64 shrink-0 border-r border-border bg-surface p-4">
        <div className="mb-6 flex items-center gap-2 px-2 py-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            G
          </span>
          <span className="text-sm font-semibold text-ink">Admin</span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/admin" }}
              className="rounded-lg px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-page hover:text-ink [&.active]:bg-accent-tint [&.active]:font-medium [&.active]:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          className="mt-6 px-3 text-sm text-ink-muted hover:text-ink-secondary"
          onClick={() => {
            adminAuth.clearToken();
            navigate({ to: "/admin/login" });
          }}
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-8 sm:p-10">{children}</main>
    </div>
  );
}
