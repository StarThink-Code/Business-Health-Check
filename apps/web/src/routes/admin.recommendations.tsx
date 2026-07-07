import { createFileRoute } from "@tanstack/react-router";
import { AdminComingSoon } from "../components/AdminComingSoon";

export const Route = createFileRoute("/admin/recommendations")({
  component: () => <AdminComingSoon title="Recommendation Management" />,
});
