"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred while loading this page. Please try again
        or contact support if the problem persists.
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      ) : null}
      <Button className="mt-8 gap-2" onClick={reset}>
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
