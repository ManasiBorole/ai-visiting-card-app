import { prisma } from "@/database/client";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

function formatDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getLast7Days() {
  const days: Date[] = [];
  const today = startOfDay(new Date());

  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    days.push(day);
  }

  return days;
}

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const sevenDaysAgo = getLast7Days()[0];

  const [
    totalCards,
    todayAddedCards,
    weekAddedCards,
    uncategorizedCards,
    recentContacts,
    cardsLast7Days,
    categoryGroups,
    allCategories,
  ] = await Promise.all([
    prisma.visitingCard.count({ where: { userId } }),
    prisma.visitingCard.count({
      where: { userId, createdAt: { gte: todayStart } },
    }),
    prisma.visitingCard.count({
      where: { userId, createdAt: { gte: weekStart } },
    }),
    prisma.visitingCard.count({
      where: { userId, categoryId: null },
    }),
    prisma.visitingCard.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        company: true,
        designation: true,
        mobile: true,
        email: true,
        city: true,
        updatedAt: true,
        createdAt: true,
        category: {
          select: { id: true, name: true, color: true },
        },
      },
    }),
    prisma.visitingCard.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true },
    }),
    prisma.visitingCard.groupBy({
      by: ["categoryId"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
  ]);

  const dayCounts = new Map<string, number>();

  for (const day of getLast7Days()) {
    dayCounts.set(formatDayKey(day), 0);
  }

  for (const card of cardsLast7Days) {
    const key = formatDayKey(startOfDay(card.createdAt));
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }

  const cardsTrend = getLast7Days().map((day) => {
    const key = formatDayKey(day);
    return {
      date: day.toLocaleDateString("en-US", { weekday: "short" }),
      fullDate: day.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: dayCounts.get(key) ?? 0,
    };
  });

  const categoryMap = new Map(
    allCategories.map((category) => [category.id, category])
  );

  const categoryBreakdown = categoryGroups
    .map((group) => {
      if (!group.categoryId) {
        return {
          id: "uncategorized",
          name: "Uncategorized",
          color: "#94a3b8",
          count: group._count._all,
        };
      }

      const category = categoryMap.get(group.categoryId);

      return {
        id: group.categoryId,
        name: category?.name ?? "Unknown",
        color: category?.color ?? "#6366f1",
        count: group._count._all,
      };
    })
    .sort((a, b) => b.count - a.count);

  const categoriesWithCounts = allCategories.map((category) => {
    const match = categoryGroups.find(
      (group) => group.categoryId === category.id
    );

    return {
      ...category,
      count: match?._count._all ?? 0,
    };
  });

  return {
    totalCards,
    todayAddedCards,
    weekAddedCards,
    uncategorizedCards,
    activeCategories: categoryBreakdown.length,
    recentContacts,
    cardsTrend,
    categoryBreakdown,
    categories: categoriesWithCounts,
  };
}

export async function searchVisitingCards(userId: string, query: string) {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  return prisma.visitingCard.findMany({
    where: {
      userId,
      OR: [
        { name: { contains: trimmed } },
        { company: { contains: trimmed } },
        { email: { contains: trimmed } },
        { mobile: { contains: trimmed } },
        { city: { contains: trimmed } },
        { designation: { contains: trimmed } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: { category: true },
  });
}

export async function getAllUserCards(userId: string) {
  return prisma.visitingCard.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });
}
