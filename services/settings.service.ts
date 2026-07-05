import bcrypt from "bcryptjs";

import { prisma } from "@/database/client";
import { findOrCreateCategoryByName } from "@/services/category.service";
import {
  BACKUP_VERSION,
  deleteAccountSchema,
  restoreBackupSchema,
  updateProfileSchema,
  type DeleteAccountInput,
  type RestoreBackupInput,
  type UpdateProfileInput,
} from "@/lib/validations/settings";
import { createVisitingCardSchema } from "@/lib/validations/visiting-card";

function cardTags(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === "string");
  }
  return [];
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  const data = updateProfileSchema.parse(input);
  const email = data.email.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: {
      email,
      NOT: { id: userId },
    },
  });

  if (existing) {
    throw new Error("Another account is already using this email");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name.trim(),
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "Updated profile settings",
      userId,
    },
  });

  return user;
}

export async function createUserBackup(userId: string) {
  const [user, visitingCards, activityLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.visitingCard.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        category: {
          select: { name: true, color: true },
        },
      },
    }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      include: {
        visitingCard: {
          select: { name: true },
        },
      },
    }),
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  const categories = [
    ...new Map(
      visitingCards
        .filter((card) => card.category)
        .map((card) => [
          card.category!.name,
          {
            name: card.category!.name,
            color: card.category!.color,
          },
        ])
    ).values(),
  ];

  return {
    version: BACKUP_VERSION,
    type: "backup",
    app: "visiting-card-ai",
    exportedAt: new Date().toISOString(),
    user: {
      name: user.name,
      email: user.email,
      memberSince: user.createdAt.toISOString(),
    },
    summary: {
      visitingCards: visitingCards.length,
      activityLogs: activityLogs.length,
      categories: categories.length,
    },
    categories,
    visitingCards: visitingCards.map((card) => ({
      name: card.name,
      company: card.company,
      designation: card.designation,
      mobile: card.mobile,
      alternateMobile: card.alternateMobile,
      email: card.email,
      website: card.website,
      address: card.address,
      city: card.city,
      state: card.state,
      country: card.country,
      pinCode: card.pinCode,
      gstNumber: card.gstNumber,
      notes: card.notes,
      tags: cardTags(card.tags),
      frontImage: card.frontImage,
      backImage: card.backImage,
      categoryName: card.category?.name ?? null,
      createdAt: card.createdAt.toISOString(),
      updatedAt: card.updatedAt.toISOString(),
    })),
    activityLogs: activityLogs.map((log) => ({
      action: log.action,
      date: log.date.toISOString(),
      visitingCardName: log.visitingCard?.name ?? null,
    })),
  };
}

export async function exportAllUserData(userId: string) {
  const backup = await createUserBackup(userId);

  return {
    ...backup,
    type: "full-export",
    exportLabel: "Complete CRM data export",
    includes: [
      "Profile snapshot",
      "All visiting cards",
      "Activity history",
      "Category references",
      "Card images paths",
      "Tags and notes",
    ],
  };
}

type BackupCard = {
  name: string;
  company?: string | null;
  designation?: string | null;
  mobile?: string | null;
  alternateMobile?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pinCode?: string | null;
  gstNumber?: string | null;
  notes?: string | null;
  tags?: string[];
  frontImage?: string | null;
  backImage?: string | null;
  categoryName?: string | null;
};

async function resolveCategoryId(userId: string, categoryName?: string | null) {
  if (!categoryName?.trim()) return undefined;

  return findOrCreateCategoryByName(userId, categoryName.trim());
}

export async function restoreUserBackup(
  userId: string,
  input: RestoreBackupInput
) {
  const parsed = restoreBackupSchema.parse(input);

  if (parsed.backup.version !== BACKUP_VERSION) {
    throw new Error("Unsupported backup version");
  }

  const cards = parsed.backup.visitingCards as BackupCard[];

  if (parsed.mode === "replace") {
    await prisma.visitingCard.deleteMany({ where: { userId } });
  }

  let imported = 0;
  let skipped = 0;

  for (const card of cards) {
    if (!card.name?.trim()) {
      skipped += 1;
      continue;
    }

    const categoryId = await resolveCategoryId(userId, card.categoryName);

    const validated = createVisitingCardSchema.safeParse({
      name: card.name,
      company: card.company ?? undefined,
      designation: card.designation ?? undefined,
      mobile: card.mobile ?? undefined,
      alternateMobile: card.alternateMobile ?? undefined,
      email: card.email ?? undefined,
      website: card.website ?? undefined,
      address: card.address ?? undefined,
      city: card.city ?? undefined,
      state: card.state ?? undefined,
      pinCode: card.pinCode ?? undefined,
      gstNumber: card.gstNumber ?? undefined,
      notes: card.notes ?? undefined,
      frontImage: card.frontImage ?? undefined,
      backImage: card.backImage ?? undefined,
      categoryId,
    });

    if (!validated.success) {
      skipped += 1;
      continue;
    }

    if (parsed.mode === "merge") {
      const duplicate = await prisma.visitingCard.findFirst({
        where: {
          userId,
          name: validated.data.name,
          company: validated.data.company ?? null,
        },
      });

      if (duplicate) {
        skipped += 1;
        continue;
      }
    }

    await prisma.visitingCard.create({
      data: {
        ...validated.data,
        country: card.country ?? undefined,
        tags: card.tags && card.tags.length > 0 ? card.tags : undefined,
        userId,
      },
    });

    imported += 1;
  }

  await prisma.activityLog.create({
    data: {
      action: `Restored backup (${imported} imported, ${skipped} skipped)`,
      userId,
    },
  });

  return { imported, skipped, total: cards.length };
}

export async function deleteUserAccount(userId: string, input: DeleteAccountInput) {
  const data = deleteAccountSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.passwordHash) {
    if (!data.password?.trim()) {
      throw new Error("Password is required to delete your account");
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new Error("Incorrect password");
    }

    if (data.confirmation.trim().toLowerCase() !== "delete my account") {
      throw new Error('Type "delete my account" to confirm');
    }
  } else if (data.confirmation.trim().toLowerCase() !== user.email.toLowerCase()) {
    throw new Error("Type your email address to confirm account deletion");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return { success: true };
}
