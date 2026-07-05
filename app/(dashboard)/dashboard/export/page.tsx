import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ImportExportPanel } from "@/components/import-export/import-export-panel";
import { PdfReportsPanel } from "@/components/reports/pdf-reports-panel";
import { ROUTES } from "@/lib/constants";
import { getCategoriesWithCounts } from "@/services/category.service";
import { getExportContacts } from "@/services/import-export.service";

export const metadata: Metadata = {
  title: "Import & Export",
};

export default async function ExportPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const [contacts, { categories }] = await Promise.all([
    getExportContacts(session.user.id),
    getCategoriesWithCounts(session.user.id),
  ]);

  return (
    <DashboardShell
      title="Import & Export"
      subtitle="Download your CRM data, import spreadsheets, and generate PDF reports"
      userName={session.user.name}
    >
      <div className="space-y-6">
        <PdfReportsPanel
          contactCount={contacts.length}
          categoryCount={categories.length}
        />
        <ImportExportPanel contactCount={contacts.length} />
      </div>
    </DashboardShell>
  );
}
