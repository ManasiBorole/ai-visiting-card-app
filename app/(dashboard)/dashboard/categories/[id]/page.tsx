import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { AssignCardsPanel } from "@/components/categories/assign-cards-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import {
  getAssignableCards,
  getCategoryWithUserContacts,
} from "@/services/category.service";

type CategoryDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return { title: "Category" };
  }

  const category = await getCategoryWithUserContacts(session.user.id, id);

  return {
    title: category?.name ?? "Category",
  };
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const { id } = await params;
  const [category, assignableCards] = await Promise.all([
    getCategoryWithUserContacts(session.user.id, id),
    getAssignableCards(session.user.id, id),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <DashboardShell
      title={category.name}
      subtitle={`${category.visitingCards.length} contact${category.visitingCards.length === 1 ? "" : "s"} in this category`}
      userName={session.user.name}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={ROUTES.categories}>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to categories
            </Button>
          </Link>
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            style={{
              color: category.color,
              backgroundColor: `${category.color}15`,
              border: `1px solid ${category.color}40`,
            }}
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </span>
        </div>

        <AssignCardsPanel
          categoryId={category.id}
          categoryName={category.name}
          contacts={category.visitingCards}
          assignableCards={assignableCards}
        />
      </div>
    </DashboardShell>
  );
}
