"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  CreditCard,
  Download,
  LayoutDashboard,
  Search,
  Settings,
  Tags,
  Upload,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Separator } from "@/components/ui/separator";
import { APP_NAME, DASHBOARD_NAV, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  home: LayoutDashboard,
  cards: CreditCard,
  upload: Upload,
  search: Search,
  categories: Tags,
  export: Download,
  ai: Brain,
  settings: Settings,
} as const;

type DashboardSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function DashboardSidebar({
  className,
  onNavigate,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
          <span className="text-xs font-bold">VC</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            {APP_NAME}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/70">
            CRM Dashboard
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {DASHBOARD_NAV.map((item) => {
          const Icon = iconMap[item.segment];
          const isActive =
            pathname === item.href ||
            (item.href !== ROUTES.dashboard && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href={ROUTES.profile}
          onClick={onNavigate}
          className="mb-2 block rounded-xl px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          View profile
        </Link>
        <LogoutButton
          variant="outline"
          className="w-full justify-center border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent"
        />
      </div>
    </div>
  );
}

export function DashboardSidebarHeader({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <DashboardSidebar onNavigate={onNavigate} />
      <Separator className="lg:hidden" />
    </>
  );
}
