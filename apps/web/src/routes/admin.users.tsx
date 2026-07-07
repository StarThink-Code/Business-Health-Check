import { createFileRoute } from "@tanstack/react-router";
import { AdminComingSoon } from "../components/AdminComingSoon";

export const Route = createFileRoute("/admin/users")({
  component: () => <AdminComingSoon title="Admin Users" />,
});
