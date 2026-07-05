"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";

type DeleteAccountSettingsProps = {
  email: string;
  hasPassword: boolean;
};

export function DeleteAccountSettings({
  email,
  hasPassword,
}: DeleteAccountSettingsProps) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/settings/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: hasPassword ? password : undefined,
          confirmation,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to delete account");
      }

      await signOut({ callbackUrl: ROUTES.home });
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete account"
      );
      setIsDeleting(false);
    }
  }

  return (
    <Card className="border-destructive/30 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-4" />
          Delete account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all visiting cards. This action
          cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {hasPassword ? (
          <div className="space-y-2">
            <Label htmlFor="delete-password">Current password</Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="delete-confirmation">
            {hasPassword
              ? 'Type "delete my account" to confirm'
              : "Type your email address to confirm"}
          </Label>
          <Input
            id="delete-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={hasPassword ? "delete my account" : email}
          />
        </div>

        <Button
          type="button"
          variant="destructive"
          className="gap-2"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          {isDeleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Delete account permanently
        </Button>
      </CardContent>
    </Card>
  );
}
