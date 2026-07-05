import { prisma } from "@/database/client";
import {
  assignCardsSchema,
  createCategorySchema,
  updateCategorySchema,
  type AssignCardsInput,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/validations/category";

async function assertCategoryOwnership(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true, name: true, color: true },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
}

export async function getCategoriesWithCounts(userId: string) {
  const [categories, categoryGroups, uncategorizedCount] = await Promise.all([
    prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
    prisma.visitingCard.groupBy({
      by: ["categoryId"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.visitingCard.count({
      where: { userId, categoryId: null },
    }),
  ]);

  const countMap = new Map(
    categoryGroups.map((group) => [group.categoryId, group._count._all])
  );

  return {
    categories: categories.map((category) => ({
      ...category,
      count: countMap.get(category.id) ?? 0,
    })),
    uncategorizedCount,
  };
}

export async function getCategoryWithUserContacts(
  userId: string,
  categoryId: string
) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: {
      id: true,
      name: true,
      color: true,
      visitingCards: {
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          company: true,
          designation: true,
          mobile: true,
          email: true,
          city: true,
          updatedAt: true,
        },
      },
    },
  });

  return category;
}

export async function getUncategorizedContacts(userId: string) {
  return prisma.visitingCard.findMany({
    where: { userId, categoryId: null },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      company: true,
      designation: true,
      mobile: true,
      email: true,
      city: true,
      updatedAt: true,
    },
  });
}

export async function getAssignableCards(userId: string, categoryId: string) {
  await assertCategoryOwnership(userId, categoryId);

  return prisma.visitingCard.findMany({
    where: {
      userId,
      OR: [{ categoryId: null }, { categoryId: { not: categoryId } }],
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      company: true,
      mobile: true,
      category: {
        select: { id: true, name: true, color: true },
      },
    },
  });
}

export async function createCategory(
  userId: string,
  input: CreateCategoryInput
) {
  const data = createCategorySchema.parse(input);

  const existing = await prisma.category.findFirst({
    where: { userId, name: data.name },
  });

  if (existing) {
    throw new Error("A category with this name already exists");
  }

  return prisma.category.create({
    data: { ...data, userId },
    select: { id: true, name: true, color: true },
  });
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  input: UpdateCategoryInput
) {
  const data = updateCategorySchema.parse(input);

  await assertCategoryOwnership(userId, categoryId);

  const duplicate = await prisma.category.findFirst({
    where: {
      userId,
      name: data.name,
      NOT: { id: categoryId },
    },
  });

  if (duplicate) {
    throw new Error("A category with this name already exists");
  }

  return prisma.category.update({
    where: { id: categoryId },
    data,
    select: { id: true, name: true, color: true },
  });
}

export async function deleteCategory(userId: string, categoryId: string) {
  const category = await assertCategoryOwnership(userId, categoryId);

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return category;
}

export async function assignCardsToCategory(
  userId: string,
  categoryId: string,
  input: AssignCardsInput
) {
  const { cardIds } = assignCardsSchema.parse(input);

  await assertCategoryOwnership(userId, categoryId);

  const result = await prisma.visitingCard.updateMany({
    where: {
      userId,
      id: { in: cardIds },
    },
    data: { categoryId },
  });

  return result.count;
}

export async function removeCardsFromCategory(
  userId: string,
  cardIds: string[]
) {
  if (cardIds.length === 0) {
    return 0;
  }

  const result = await prisma.visitingCard.updateMany({
    where: {
      userId,
      id: { in: cardIds },
    },
    data: { categoryId: null },
  });

  return result.count;
}

export async function findOrCreateCategoryByName(
  userId: string,
  categoryName: string,
  color = "#4338ca"
) {
  const existing = await prisma.category.findFirst({
    where: { userId, name: categoryName.trim() },
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.category.create({
    data: {
      userId,
      name: categoryName.trim(),
      color,
    },
  });

  return created.id;
}
