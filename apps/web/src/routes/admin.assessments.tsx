import { createFileRoute, Outlet } from "@tanstack/react-router";

// Pathless layout: exists only so /admin/assessments and
// /admin/assessments/$assessmentId can both be file-routes without one
// swallowing the other's content. Each child still wraps itself in
// <AdminShell>, matching every other admin page.
export const Route = createFileRoute("/admin/assessments")({
  component: () => <Outlet />,
});
