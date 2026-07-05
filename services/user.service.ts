import { prisma } from "@/database/client";

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          visitingCards: true,
          activityLogs: true,
        },
      },
      visitingCards: {
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: {
          id: true,
          name: true,
          company: true,
          designation: true,
          mobile: true,
          email: true,
          city: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
      activityLogs: {
        orderBy: { date: "desc" },
        take: 5,
        select: {
          id: true,
          action: true,
          date: true,
          visitingCard: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function getUserVisitingCards(userId: string) {
  return prisma.visitingCard.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
    },
  });
}
