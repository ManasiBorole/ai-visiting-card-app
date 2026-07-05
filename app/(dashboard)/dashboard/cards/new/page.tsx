import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AddVisitingCardForm } from "@/components/visiting-cards/add-card-form";
import { ROUTES } from "@/lib/constants";
import { getCategoriesForSelect } from "@/services/visiting-card.service";

export const metadata: Metadata = {
  title: "Add Visiting Card",
};

type AddVisitingCardPageProps = {
  searchParams: Promise<{ frontImage?: string; backImage?: string }>;
};

export default async function AddVisitingCardPage({
  searchParams,
}: AddVisitingCardPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const params = await searchParams;
  const categories = await getCategoriesForSelect(session.user.id);

  return (
    <DashboardShell
      title="Add visiting card"
      subtitle="Capture contact details and save them to your CRM library"
      userName={session.user.name}
    >
      <AddVisitingCardForm
        categories={categories}
        initialFrontImage={params.frontImage}
        initialBackImage={params.backImage}
      />
    </DashboardShell>
  );
}
