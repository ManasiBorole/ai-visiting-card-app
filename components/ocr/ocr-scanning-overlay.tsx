"use client";

import { Loader2, ScanLine } from "lucide-react";

import { cn } from "@/lib/utils";

type OcrScanningOverlayProps = {
  open: boolean;
  status: string;
  progress: number;
};

export function OcrScanningOverlay({
  open,
  status,
  progress,
}: OcrScanningOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6 flex size-24 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
            <div className="relative flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ScanLine className="size-9 animate-pulse" />
            </div>
            <Loader2 className="absolute -right-1 -bottom-1 size-7 animate-spin text-primary" />
          </div>

          <h3 className="text-lg font-semibold tracking-tight">
            Scanning visiting card
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{status}</p>

          <div className="mt-6 w-full">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>OCR progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                )}
                style={{ width: `${Math.max(progress, 8)}%` }}
              />
            </div>
          </div>

          <div className="mt-6 h-28 w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30">
            <div className="relative h-full w-full">
              <div className="absolute inset-x-4 top-0 h-0.5 animate-[scan_2s_ease-in-out_infinite] bg-primary shadow-[0_0_12px_var(--primary)]" />
              <div className="flex h-full items-center justify-center px-6 text-xs text-muted-foreground">
                Extracting name, company, phone, email, website, address, and GST...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
