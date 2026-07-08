import type {
  AdminAssessmentDetail,
  AdminCategory,
  AdminUser,
  Assessment,
  AssessmentReport,
  Question,
  RecommendationRule,
} from "@bhc/shared";
import type {
  AdminLoginInput,
  CategoryInput,
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

// ---- Admin: GET /api/admin/assessments/:id ----
export type AdminGetAssessmentResponse = AdminAssessmentDetail;

// ---- Admin: GET /api/admin/categories ----
export interface AdminListCategoriesResponse {
  categories: AdminCategory[];
}

// ---- Admin: POST /api/admin/categories ----
export type AdminCreateCategoryRequest = CategoryInput;
export type AdminCreateCategoryResponse = AdminCategory;

// ---- Admin: PUT /api/admin/categories/:id ----
export type AdminUpdateCategoryRequest = CategoryInput;
export type AdminUpdateCategoryResponse = AdminCategory;

// ---- Admin: DELETE /api/admin/categories/:id ----
export interface AdminDeleteCategoryResponse {
  deleted: true;
}

// ---- Admin: GET /api/admin/recommendations ----
export interface AdminListRecommendationRulesResponse {
  rules: RecommendationRule[];
}

// ---- Admin: POST /api/admin/recommendations ----
export type AdminCreateRecommendationRuleRequest = RecommendationRuleInput;
export type AdminCreateRecommendationRuleResponse = RecommendationRule;

// ---- Admin: PUT /api/admin/recommendations/:id ----
export type AdminUpdateRecommendationRuleRequest = RecommendationRuleInput;
export type AdminUpdateRecommendationRuleResponse = RecommendationRule;

// ---- Admin: DELETE /api/admin/recommendations/:id ----
export interface AdminDeleteRecommendationRuleResponse {
  deleted: true;
}
