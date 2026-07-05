"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="size-8 animate-pulse rounded-lg bg-muted" aria-hidden />
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href={ROUTES.login}>
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </Link>
        <Link href={ROUTES.signup}>
          <Button size="sm">Get started</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={ROUTES.dashboard}>
        <Button variant="ghost" size="sm">
          Dashboard
        </Button>
      </Link>
      <Link href={ROUTES.profile}>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="size-4" />
          <span className="hidden max-w-28 truncate sm:inline">
            {session.user.name ?? "Profile"}
          </span>
        </Button>
      </Link>
      <LogoutButton variant="ghost" size="sm" />
    </div>
  );
}
