import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AiHubPanel } from "@/components/ai/ai-hub-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "AI Assistant",
};

export default async function AiPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  return (
    <DashboardShell
      title="AI Assistant"
      subtitle="Smart duplicate detection, summaries, search, and field corrections"
      userName={session.user.name}
    >
      <AiHubPanel />
    </DashboardShell>
  );
}
