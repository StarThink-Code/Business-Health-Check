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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-4 px-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Admin
        </p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 [&.active]:bg-indigo-50 [&.active]:font-medium [&.active]:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          className="mt-6 px-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          onClick={() => {
            adminAuth.clearToken();
            navigate({ to: "/admin/login" });
          }}
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
