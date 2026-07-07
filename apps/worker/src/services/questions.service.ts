import { eq } from "drizzle-orm";
import { categories, questionOptions, questions, type Database } from "@bhc/database";
import type { AssessmentCategorySlug, Question } from "@bhc/shared";

/** Loads questions with their options, mapped to the domain `Question` shape used by the scoring engine. */
export async function loadQuestions(db: Database, opts: { activeOnly: boolean }): Promise<Question[]> {
  const categoryRows = opts.activeOnly
    ? await db.select().from(categories).where(eq(categories.isActive, true))
    : await db.select().from(categories);

  const questionRows = opts.activeOnly
    ? await db.select().from(questions).where(eq(questions.isActive, true))
    : await db.select().from(questions);

  const optionRows = await db.select().from(questionOptions);

  const categoryById = new Map(categoryRows.map((c) => [c.id, c]));
  const optionsByQuestionId = new Map<string, typeof optionRows>();
  for (const option of optionRows) {
    const bucket = optionsByQuestionId.get(option.questionId) ?? [];
    bucket.push(option);
    optionsByQuestionId.set(option.questionId, bucket);
  }

  return questionRows
    .filter((q) => categoryById.has(q.categoryId))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((q) => ({
      id: q.id,
      categorySlug: categoryById.get(q.categoryId)!.slug as AssessmentCategorySlug,
      prompt: q.prompt,
      helpText: q.helpText,
      sortOrder: q.sortOrder,
      isActive: q.isActive,
      options: (optionsByQuestionId.get(q.id) ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((o) => ({
          id: o.id,
          questionId: o.questionId,
          label: o.label,
          score: o.score,
          sortOrder: o.sortOrder,
        })),
    }));
}
