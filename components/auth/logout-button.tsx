"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function LogoutButton({
  variant = "outline",
  size = "default",
  className,
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    await signOut({ callbackUrl: ROUTES.login });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      disabled={isLoading}
      onClick={handleLogout}
    >
      <LogOut className="size-4" />
      {size !== "icon" ? (
        <span>{isLoading ? "Signing out..." : "Sign out"}</span>
      ) : null}
    </Button>
  );
}
