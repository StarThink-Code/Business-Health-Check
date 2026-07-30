import { eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { categories, questionOptions, questions, type Database } from "@bhc/database";
import type { Question } from "@bhc/shared";
import type { QuestionInput } from "@bhc/validation";
import { newId } from "../lib/ids";
import { loadQuestions } from "./questions.service";

async function resolveCategoryId(db: Database, categorySlug: string): Promise<string> {
  const [category] = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
  if (!category) {
    throw new HTTPException(400, { message: `Unknown category: ${categorySlug}` });
  }
  return category.id;
}

async function getQuestionOrThrow(db: Database, questionId: string): Promise<Question> {
  const all = await loadQuestions(db, { activeOnly: false });
  const question = all.find((q) => q.id === questionId);
  if (!question) throw new HTTPException(404, { message: "Question not found" });
  return question;
}

export async function listAllQuestions(db: Database): Promise<Question[]> {
  return loadQuestions(db, { activeOnly: false });
}

export async function createQuestion(db: Database, input: QuestionInput): Promise<Question> {
  const categoryId = await resolveCategoryId(db, input.categorySlug);
  const questionId = newId("q");

  await db.insert(questions).values({
    id: questionId,
    categoryId,
    prompt: input.prompt,
    helpText: input.helpText || null,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  });

  await db.insert(questionOptions).values(
    input.options.map((o) => ({
      id: newId("opt"),
      questionId,
      label: o.label,
      score: o.score,
      sortOrder: o.sortOrder,
    })),
  );

  return getQuestionOrThrow(db, questionId);
}

export async function updateQuestion(db: Database, questionId: string, input: QuestionInput): Promise<Question> {
  await getQuestionOrThrow(db, questionId); // 404s if missing
  const categoryId = await resolveCategoryId(db, input.categorySlug);

  await db
    .update(questions)
    .set({
      categoryId,
      prompt: input.prompt,
      helpText: input.helpText || null,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(questions.id, questionId));

  // Diff against the existing option set instead of delete-and-reinsert: options
  // that already have submitted answers can't be deleted (assessment_answers.optionId
  // is onDelete: restrict), so kept options must be updated in place.
  const existing = await db
    .select({ id: questionOptions.id })
    .from(questionOptions)
    .where(eq(questionOptions.questionId, questionId));
  const existingIds = new Set(existing.map((o) => o.id));

  for (const option of input.options) {
    if (option.id && !existingIds.has(option.id)) {
      throw new HTTPException(400, { message: `Unknown option id: ${option.id}` });
    }
  }

  const keepIds = new Set(input.options.flatMap((o) => (o.id ? [o.id] : [])));
  const idsToDelete = [...existingIds].filter((id) => !keepIds.has(id));

  if (idsToDelete.length > 0) {
    try {
      await db.delete(questionOptions).where(inArray(questionOptions.id, idsToDelete));
    } catch (err) {
      throw new HTTPException(409, {
        message:
          "One or more removed options already have submitted answers and can't be deleted. Disable the question instead of removing those options.",
        cause: err,
      });
    }
  }

  for (const option of input.options) {
    if (option.id) {
      await db
        .update(questionOptions)
        .set({ label: option.label, score: option.score, sortOrder: option.sortOrder })
        .where(eq(questionOptions.id, option.id));
    } else {
      await db.insert(questionOptions).values({
        id: newId("opt"),
        questionId,
        label: option.label,
        score: option.score,
        sortOrder: option.sortOrder,
      });
    }
  }

  return getQuestionOrThrow(db, questionId);
}

export async function deleteQuestion(db: Database, questionId: string): Promise<void> {
  await getQuestionOrThrow(db, questionId); // 404s if missing
  try {
    await db.delete(questions).where(eq(questions.id, questionId));
  } catch (err) {
    throw new HTTPException(409, {
      message: "This question has existing answers and can't be deleted. Disable it instead.",
      cause: err,
    });
  }
}
