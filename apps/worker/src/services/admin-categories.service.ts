import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { categories, questions, recommendationRules, type Database } from "@bhc/database";
import type { AdminCategory } from "@bhc/shared";
import type { CategoryInput } from "@bhc/validation";
import { newId } from "../lib/ids";

export async function listCategories(db: Database): Promise<AdminCategory[]> {
  const [categoryRows, questionRows] = await Promise.all([
    db.select().from(categories),
    db.select({ categoryId: questions.categoryId }).from(questions),
  ]);

  const countByCategory = new Map<string, number>();
  for (const q of questionRows) {
    countByCategory.set(q.categoryId, (countByCategory.get(q.categoryId) ?? 0) + 1);
  }

  return categoryRows
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      label: c.label,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      questionCount: countByCategory.get(c.id) ?? 0,
    }));
}

async function assertSlugAvailable(db: Database, slug: string, excludeId?: string): Promise<void> {
  const existing = await db.select().from(categories).where(eq(categories.slug, slug));
  if (existing.some((c) => c.id !== excludeId)) {
    throw new HTTPException(409, { message: `A category with slug "${slug}" already exists` });
  }
}

export async function createCategory(db: Database, input: CategoryInput): Promise<AdminCategory> {
  await assertSlugAvailable(db, input.slug);
  const id = newId("cat");
  await db.insert(categories).values({
    id,
    slug: input.slug,
    label: input.label,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  });
  return { id, slug: input.slug, label: input.label, sortOrder: input.sortOrder, isActive: input.isActive, questionCount: 0 };
}

export async function updateCategory(db: Database, id: string, input: CategoryInput): Promise<AdminCategory> {
  const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!existing) {
    throw new HTTPException(404, { message: "Category not found" });
  }
  await assertSlugAvailable(db, input.slug, id);

  await db
    .update(categories)
    .set({ slug: input.slug, label: input.label, sortOrder: input.sortOrder, isActive: input.isActive })
    .where(eq(categories.id, id));

  const questionRows = await db.select().from(questions).where(eq(questions.categoryId, id));
  return {
    id,
    slug: input.slug,
    label: input.label,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
    questionCount: questionRows.length,
  };
}

export async function deleteCategory(db: Database, id: string): Promise<void> {
  const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!existing) {
    throw new HTTPException(404, { message: "Category not found" });
  }

  const [question] = await db.select().from(questions).where(eq(questions.categoryId, id)).limit(1);
  if (question) {
    throw new HTTPException(409, {
      message: "This category has questions assigned to it. Move or delete those questions first, or disable the category instead.",
    });
  }
  const [rule] = await db.select().from(recommendationRules).where(eq(recommendationRules.categoryId, id)).limit(1);
  if (rule) {
    throw new HTTPException(409, {
      message: "This category has recommendation rules assigned to it. Remove those rules first, or disable the category instead.",
    });
  }

  await db.delete(categories).where(eq(categories.id, id));
}
