"use client";

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type GeminiAnalyzingOverlayProps = {
  open: boolean;
  status: string;
  progress: number;
  currentIndex?: number;
  total?: number;
};

export function GeminiAnalyzingOverlay({
  open,
  status,
  progress,
  currentIndex,
  total,
}: GeminiAnalyzingOverlayProps) {
  if (!open) return null;

  const batchLabel =
    currentIndex !== undefined && total !== undefined && total > 1
      ? `Processing card ${currentIndex}/${total}`
      : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[oklch(0.14_0.05_264/0.88)] p-4 backdrop-blur-xl">
      <div className="glass-card w-full max-w-md rounded-3xl p-8 premium-shadow">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8 flex size-28 items-center justify-center">
            <div
              className="absolute inset-0 rounded-3xl vault-gradient opacity-20"
              style={{ animation: "vault-pulse 2s ease-in-out infinite" }}
            />
            <div className="relative size-24 overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.22_0.06_264)] shadow-2xl">
              <div
                className="absolute inset-x-3 h-0.5 rounded-full bg-gradient-to-r from-transparent via-sky-300 to-transparent"
                style={{ animation: "scan 2.2s ease-in-out infinite" }}
              />
              <div className="flex h-full items-center justify-center">
                <Sparkles className="size-10 text-sky-200" />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold tracking-tight text-white">
            CardVault AI is unlocking your connections
          </h3>
          {batchLabel ? (
            <p className="mt-2 text-sm font-medium text-sky-200">{batchLabel}</p>
          ) : null}
          <p className="mt-2 text-sm text-white/70">{status}</p>
          <p className="mt-1 text-xs text-white/50">
            Understanding company, person, address and details
          </p>

          <div className="mt-8 w-full">
            <div className="mb-2 flex items-center justify-between text-xs text-white/60">
              <span>AI analysis</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 transition-all duration-500"
                )}
                style={{ width: `${Math.max(progress, 8)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
