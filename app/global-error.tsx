"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-neutral-50">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <AlertTriangle className="size-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Application error
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            A critical error occurred. Please refresh the page to continue.
          </p>
          {error.digest ? (
            <p className="mt-4 font-mono text-xs text-neutral-500">
              Error ID: {error.digest}
            </p>
          ) : null}
          <Button
            className="mt-8 gap-2 bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            onClick={reset}
          >
            <RefreshCw className="size-4" />
            Reload application
          </Button>
        </div>
      </body>
    </html>
  );
}
