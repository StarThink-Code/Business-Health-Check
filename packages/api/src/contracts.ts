import type {
  AdminUser,
  Assessment,
  AssessmentReport,
  Question,
} from "@bhc/shared";
import type {
  AdminLoginInput,
  QuestionInput,
  RecommendationRuleInput,
  StartAssessmentInput,
  SubmitAssessmentInput,
} from "@bhc/validation";

// ---- Public: POST /api/assessment/start ----
export type StartAssessmentRequest = StartAssessmentInput;
export interface StartAssessmentResponse {
  assessmentId: string;
}

// ---- Public: GET /api/questions ----
export interface GetQuestionsResponse {
  questions: Question[];
}

// ---- Public: POST /api/assessment/submit ----
export type SubmitAssessmentRequest = SubmitAssessmentInput;
export interface SubmitAssessmentResponse {
  reportId: string;
}

// ---- Public: GET /api/report/:id ----
export type GetReportResponse = AssessmentReport;

// ---- Admin: POST /api/admin/login ----
export type AdminLoginRequest = AdminLoginInput;
export interface AdminLoginResponse {
  token: string;
  admin: AdminUser;
}

// ---- Admin: GET /api/admin/questions ----
export interface AdminListQuestionsResponse {
  questions: Question[];
}

// ---- Admin: POST /api/admin/questions ----
export type AdminCreateQuestionRequest = QuestionInput;
export type AdminCreateQuestionResponse = Question;

// ---- Admin: PUT /api/admin/questions/:id ----
export type AdminUpdateQuestionRequest = QuestionInput;
export type AdminUpdateQuestionResponse = Question;

// ---- Admin: DELETE /api/admin/questions/:id ----
export interface AdminDeleteQuestionResponse {
  deleted: true;
}

// ---- Admin: GET /api/admin/assessments ----
export interface AdminListAssessmentsResponse {
  assessments: Assessment[];
  total: number;
}

// ---- Admin: recommendation rules (Module 6 / Recommendation Management) ----
export type AdminUpsertRecommendationRuleRequest = RecommendationRuleInput;
