import { createFileRoute } from "@tanstack/react-router";
import { AdminComingSoon } from "../components/AdminComingSoon";

export const Route = createFileRoute("/admin/categories")({
  component: () => <AdminComingSoon title="Category Management" />,
});
