"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-muted">
            <WifiOff className="size-7 text-muted-foreground" />
          </div>
          <CardTitle>You are offline</CardTitle>
          <CardDescription>
            {APP_NAME} saved pages may still be available. Reconnect to sync
            contacts and use AI features.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Link
            href={ROUTES.dashboard}
            className={cn(buttonVariants(), "w-full justify-center")}
          >
            Open dashboard
          </Link>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
