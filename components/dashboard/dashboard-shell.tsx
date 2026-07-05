"use client";

import { useState } from "react";

import {
  DashboardHeader,
  DashboardMobileNav,
} from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  userName?: string | null;
};

export function DashboardShell({
  children,
  title,
  subtitle,
  userName,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:fixed lg:inset-y-0 lg:flex lg:w-72">
        <DashboardSidebar className="w-full" />
      </aside>

      <DashboardMobileNav
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />

      <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          userName={userName}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
