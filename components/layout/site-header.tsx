import Link from "next/link";

import { UserNav } from "@/components/auth/user-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  className?: string;
};

export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.home} className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <span className="text-xs font-bold tracking-tight">VC</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none tracking-tight">
              {APP_NAME}
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              AI Visiting Card Management
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
