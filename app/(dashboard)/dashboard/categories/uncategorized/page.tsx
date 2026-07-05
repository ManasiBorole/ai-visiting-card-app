import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { CategoryContactsCard } from "@/components/categories/category-contacts-list";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { getUncategorizedContacts } from "@/services/category.service";

export const metadata: Metadata = {
  title: "Uncategorized Contacts",
};

export default async function UncategorizedContactsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const contacts = await getUncategorizedContacts(session.user.id);

  return (
    <DashboardShell
      title="Uncategorized"
      subtitle="Contacts without a category assignment"
      userName={session.user.name}
    >
      <div className="space-y-6">
        <Link href={ROUTES.categories}>
          <Button type="button" variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to categories
          </Button>
        </Link>

        <CategoryContactsCard
          title="Uncategorized contacts"
          description={`${contacts.length} contact${contacts.length === 1 ? "" : "s"} without a category`}
          contacts={contacts}
          emptyMessage="All contacts are categorized."
        />
      </div>
    </DashboardShell>
  );
}
