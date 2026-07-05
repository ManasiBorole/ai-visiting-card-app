import type {
  ActivityLog,
  Category,
  User,
  VisitingCard,
} from "@/database/generated/client";

export type {
  ActivityLog,
  Category,
  Prisma,
  User,
  VisitingCard,
} from "@/database/generated/client";

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  success: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type VisitingCardWithRelations = VisitingCard & {
  category: Category | null;
  user: Pick<User, "id" | "name" | "email">;
};

export type ActivityLogWithRelations = ActivityLog & {
  user: Pick<User, "id" | "name" | "email">;
  visitingCard: Pick<VisitingCard, "id" | "name" | "company"> | null;
};
