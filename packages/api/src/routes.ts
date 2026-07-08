/** Central registry of REST paths so the frontend client and worker router never drift apart. */
export const API_ROUTES = {
  assessmentStart: "/api/assessment/start",
  questions: "/api/questions",
  assessmentSubmit: "/api/assessment/submit",
  report: (id: string) => `/api/report/${id}`,
  reportPdf: (id: string) => `/api/report/${id}/pdf`,
  adminLogin: "/api/admin/login",
  adminQuestions: "/api/admin/questions",
  adminQuestion: (id: string) => `/api/admin/questions/${id}`,
  adminAssessments: "/api/admin/assessments",
} as const;
