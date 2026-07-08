import type { AssessmentCategorySlug } from "./categories";
import type { BusinessStatus } from "./business-status";

export interface Business {
  id: string;
  name: string;
  industry: string;
  website: string | null;
  country: string;
  teamSize: string;
  businessAge: string;
  marketingBudget: string | null;
  createdAt: string;
}

export type AssessmentStatus = "in_progress" | "completed" | "abandoned";

export interface Assessment {
  id: string;
  businessId: string;
  status: AssessmentStatus;
  overallScore: number | null;
  businessStatus: BusinessStatus | null;
  startedAt: string;
  completedAt: string | null;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  label: string;
  score: number;
  sortOrder: number;
}

export interface Question {
  id: string;
  categorySlug: AssessmentCategorySlug;
  prompt: string;
  helpText: string | null;
  sortOrder: number;
  isActive: boolean;
  options: QuestionOption[];
}

export interface AssessmentAnswer {
  id: string;
  assessmentId: string;
  questionId: string;
  optionId: string;
}

export interface CategoryScore {
  categorySlug: AssessmentCategorySlug;
  label: string;
  pointsEarned: number;
  pointsPossible: number;
  /** 0-100 */
  percentage: number;
}

export interface RecommendationRule {
  id: string;
  categorySlug: AssessmentCategorySlug | null;
  /** e.g. "lt", "lte", "gt", "gte", "eq" */
  operator: ScoreComparisonOperator;
  /** Threshold compared against the category score (or overall score if categorySlug is null) */
  threshold: number;
  title: string;
  description: string;
  priority: number;
  isActive: boolean;
}

export type ScoreComparisonOperator = "lt" | "lte" | "gt" | "gte" | "eq";

export interface TriggeredRecommendation {
  ruleId: string;
  title: string;
  description: string;
  priority: number;
  categorySlug: AssessmentCategorySlug | null;
}

export interface AssessmentReport {
  assessment: Assessment;
  business: Business;
  overallScore: number;
  businessStatus: BusinessStatus;
  businessStatusLabel: string;
  categoryScores: CategoryScore[];
  strengths: CategoryScore[];
  weaknesses: CategoryScore[];
  recommendations: TriggeredRecommendation[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
  questionCount: number;
}

export interface AdminAssessmentAnswerDetail {
  questionId: string;
  categorySlug: AssessmentCategorySlug;
  categoryLabel: string;
  prompt: string;
  optionId: string;
  optionLabel: string;
  score: number;
}

export interface AdminAssessmentDetail {
  assessment: Assessment;
  business: Business;
  answers: AdminAssessmentAnswerDetail[];
}

export interface AnalyticsOverview {
  totalAssessments: number;
  completedAssessments: number;
  inProgressAssessments: number;
  /** 0-100, share of all assessments that reached "completed" */
  completionRate: number;
  /** Average overall score across completed assessments */
  averageScore: number;
  statusCounts: Record<BusinessStatus, number>;
}

export interface CategoryPerformance {
  categorySlug: AssessmentCategorySlug;
  label: string;
  /** Average category percentage across completed assessments */
  averageScore: number;
  assessmentCount: number;
}

export interface AdminAnalytics {
  overview: AnalyticsOverview;
  categoryPerformance: CategoryPerformance[];
}
