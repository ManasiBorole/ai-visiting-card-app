"use client";

import { Download, Share, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { APP_NAME } from "@/lib/constants";

type InstallAppPromptProps = {
  variant?: "card" | "inline";
};

export function InstallAppPrompt({ variant = "card" }: InstallAppPromptProps) {
  const { canInstall, isInstalled, isIOS, install } = usePwaInstall();

  if (isInstalled) {
    if (variant === "inline") {
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="size-5" />
            App installed
          </CardTitle>
          <CardDescription>
            {APP_NAME} is installed on this device and ready to use offline.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const content = (
    <div className="space-y-4">
      {canInstall ? (
        <Button onClick={() => void install()} className="gap-2">
          <Download className="size-4" />
          Install app
        </Button>
      ) : isIOS ? (
        <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <Share className="size-4" />
            Install on iPhone or iPad
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Tap the Share button in Safari</li>
            <li>Select &quot;Add to Home Screen&quot;</li>
            <li>Tap Add to install {APP_NAME}</li>
          </ol>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Open this site in Chrome or Edge on Android or desktop to install the
          app. Installation requires HTTPS in production.
        </p>
      )}
    </div>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="size-5" />
          Install app
        </CardTitle>
        <CardDescription>
          Install {APP_NAME} for quick access, full-screen mode, and offline
          support.
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
