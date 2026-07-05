import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Upload } from "lucide-react";

import { auth } from "@/auth";
import { CategoryOverview } from "@/components/dashboard/category-overview";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RecentContacts } from "@/components/dashboard/recent-contacts";
import { StatCards } from "@/components/dashboard/stat-cards";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { getDashboardStats } from "@/services/dashboard.service";

const DashboardCharts = dynamic(
  () =>
    import("@/components/dashboard/charts").then((module) => ({
      default: module.DashboardCharts,
    })),
  {
    loading: () => (
      <div className="grid gap-4 xl:grid-cols-5">
        <div className="h-72 animate-pulse rounded-xl bg-muted xl:col-span-3" />
        <div className="h-72 animate-pulse rounded-xl bg-muted xl:col-span-2" />
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardHomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const stats = await getDashboardStats(session.user.id);
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <DashboardShell
      title="Dashboard"
      subtitle={`Welcome back, ${firstName}. Here's your CRM overview.`}
      userName={session.user.name}
    >
      <div className="space-y-6">
        <Card className="overflow-hidden border-border/60 bg-gradient-to-r from-primary/10 via-background to-background shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">CRM workspace</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Manage {stats.totalCards} contacts in one place
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {stats.todayAddedCards} added today · {stats.weekAddedCards} this
                week
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href={ROUTES.upload}>
                <Button className="w-full gap-2 sm:w-auto">
                  <Upload className="size-4" />
                  Quick upload
                </Button>
              </Link>
              <Link href={ROUTES.cards}>
                <Button variant="outline" className="w-full gap-2 sm:w-auto">
                  View all cards
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <StatCards
          totalCards={stats.totalCards}
          todayAddedCards={stats.todayAddedCards}
          weekAddedCards={stats.weekAddedCards}
          activeCategories={stats.activeCategories}
        />

        <DashboardCharts
          cardsTrend={stats.cardsTrend}
          categoryBreakdown={stats.categoryBreakdown}
        />

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RecentContacts contacts={stats.recentContacts} />
          </div>
          <CategoryOverview categories={stats.categories} />
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>
              Jump into common CRM workflows
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Search contacts", href: ROUTES.search },
              { label: "Upload card", href: ROUTES.upload },
              { label: "Export data", href: ROUTES.export },
              { label: "Settings", href: ROUTES.settings },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-xl border border-border/60 px-4 py-3 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                {action.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
