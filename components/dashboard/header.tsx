"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, Upload, User } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetContent } from "@/components/ui/sheet";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ROUTES } from "@/lib/constants";

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  userName?: string | null;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
};

export function DashboardHeader({
  title,
  subtitle,
  userName,
  onMenuClick,
  showMenuButton = true,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      router.push(ROUTES.search);
      return;
    }

    router.push(`${ROUTES.search}?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {showMenuButton ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu className="size-4" />
          </Button>
        ) : null}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="hidden max-w-sm flex-1 items-center md:flex"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contacts, companies..."
              className="h-9 pl-9"
            />
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-2">
          <Link href={ROUTES.upload} className="hidden sm:block">
            <Button size="sm" className="gap-2">
              <Upload className="size-4" />
              Quick upload
            </Button>
          </Link>
          <Link href={ROUTES.upload} className="sm:hidden">
            <Button size="icon" aria-label="Quick upload">
              <Upload className="size-4" />
            </Button>
          </Link>
          <ThemeToggle />
          <Link href={ROUTES.profile}>
            <Button variant="outline" size="icon" aria-label="Profile">
              <User className="size-4" />
            </Button>
          </Link>
        </div>
      </div>

      {userName ? (
        <div className="border-t border-border/40 px-4 py-2 text-xs text-muted-foreground sm:hidden">
          Signed in as <span className="font-medium text-foreground">{userName}</span>
        </div>
      ) : null}
    </header>
  );
}

export function DashboardMobileNav({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <SheetContent open={open} onOpenChange={onOpenChange}>
      <DashboardSidebar onNavigate={() => onOpenChange(false)} />
    </SheetContent>
  );
}
