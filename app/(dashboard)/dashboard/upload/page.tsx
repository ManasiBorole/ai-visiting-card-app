import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PenLine } from "lucide-react";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UploadHub } from "@/components/upload/upload-hub";
import { Button } from "@/components/ui/button";
import { APP_TAGLINE, ROUTES } from "@/lib/constants";
import { getCategoriesForSelect } from "@/services/visiting-card.service";

export const metadata: Metadata = {
  title: "Scan Cards",
};

export default async function UploadPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const categories = await getCategoriesForSelect(session.user.id);

  return (
    <DashboardShell
      title="Scan visiting cards"
      subtitle={`${APP_TAGLINE} Single or bulk AI extraction.`}
      userName={session.user.name}
    >
      <div className="mb-6 flex justify-end">
        <Link href={ROUTES.cardsNew}>
          <Button variant="outline" className="gap-2">
            <PenLine className="size-4" />
            Add manually instead
          </Button>
        </Link>
      </div>
      <UploadHub categories={categories} />
    </DashboardShell>
  );
}
