import { prisma } from "@/database/client";
import {
  createVisitingCardSchema,
  updateVisitingCardSchema,
  type CreateVisitingCardInput,
  type UpdateVisitingCardInput,
} from "@/lib/validations/visiting-card";

function normalizeWebsite(url?: string) {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `https://${url}`;
}

export async function getCategoriesForSelect(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      color: true,
    },
  });
}

export async function createVisitingCard(
  userId: string,
  input: CreateVisitingCardInput
) {
  const data = createVisitingCardSchema.parse(input);

  if (data.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId },
    });

    if (!category) {
      throw new Error("Selected category does not exist");
    }
  }

  const card = await prisma.visitingCard.create({
    data: {
      name: data.name,
      company: data.company,
      designation: data.designation,
      mobile: data.mobile,
      alternateMobile: data.alternateMobile,
      email: data.email,
      website: normalizeWebsite(data.website),
      address: data.address,
      city: data.city,
      state: data.state,
      pinCode: data.pinCode,
      gstNumber: data.gstNumber,
      notes: data.notes,
      categoryId: data.categoryId,
      frontImage: data.frontImage,
      backImage: data.backImage,
      userId,
    },
    include: {
      category: {
        select: { id: true, name: true, color: true },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      action: `Added visiting card: ${card.name}`,
      userId,
      visitingCardId: card.id,
    },
  });

  return card;
}

export async function getUserVisitingCardsList(userId: string) {
  return prisma.visitingCard.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      category: {
        select: { id: true, name: true, color: true },
      },
    },
  });
}

export async function getVisitingCardById(userId: string, cardId: string) {
  return prisma.visitingCard.findFirst({
    where: { id: cardId, userId },
    include: {
      category: {
        select: { id: true, name: true, color: true },
      },
    },
  });
}

export async function updateVisitingCard(
  userId: string,
  cardId: string,
  input: UpdateVisitingCardInput
) {
  const data = updateVisitingCardSchema.parse(input);

  const existing = await prisma.visitingCard.findFirst({
    where: { id: cardId, userId },
  });

  if (!existing) {
    throw new Error("Visiting card not found");
  }

  if (data.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId },
    });

    if (!category) {
      throw new Error("Selected category does not exist");
    }
  }

  const card = await prisma.visitingCard.update({
    where: { id: cardId },
    data: {
      name: data.name,
      company: data.company,
      designation: data.designation,
      mobile: data.mobile,
      alternateMobile: data.alternateMobile,
      email: data.email,
      website: normalizeWebsite(data.website),
      address: data.address,
      city: data.city,
      state: data.state,
      pinCode: data.pinCode,
      gstNumber: data.gstNumber,
      notes: data.notes,
      categoryId: data.categoryId ?? null,
      frontImage: data.frontImage,
      backImage: data.backImage,
    },
    include: {
      category: {
        select: { id: true, name: true, color: true },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      action: `Updated visiting card: ${card.name}`,
      userId,
      visitingCardId: card.id,
    },
  });

  return card;
}

export async function deleteVisitingCard(userId: string, cardId: string) {
  const existing = await prisma.visitingCard.findFirst({
    where: { id: cardId, userId },
  });

  if (!existing) {
    throw new Error("Visiting card not found");
  }

  await prisma.visitingCard.delete({
    where: { id: cardId },
  });

  await prisma.activityLog.create({
    data: {
      action: `Deleted visiting card: ${existing.name}`,
      userId,
    },
  });

  return existing;
}
