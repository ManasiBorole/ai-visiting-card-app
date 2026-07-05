import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CategoryManagementPanel } from "@/components/categories/category-management-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ROUTES } from "@/lib/constants";
import { getCategoriesWithCounts } from "@/services/category.service";
import { getDashboardStats } from "@/services/dashboard.service";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const [{ categories, uncategorizedCount }, stats] = await Promise.all([
    getCategoriesWithCounts(session.user.id),
    getDashboardStats(session.user.id),
  ]);

  return (
    <DashboardShell
      title="Categories"
      subtitle="Create, edit, and organize contacts by category"
      userName={session.user.name}
    >
      <CategoryManagementPanel
        categories={categories}
        uncategorizedCount={uncategorizedCount}
        totalCards={stats.totalCards}
      />
    </DashboardShell>
  );
}
