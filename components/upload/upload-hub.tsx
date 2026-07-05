"use client";

import { useState } from "react";
import { CreditCard, Layers } from "lucide-react";

import { BulkCardScanSystem } from "@/components/upload/bulk-card-scan-system";
import { CardUploadSystem } from "@/components/upload/card-upload-system";
import { APP_TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

type UploadHubProps = {
  categories: CategoryOption[];
};

type UploadMode = "single" | "bulk";

export function UploadHub({ categories }: UploadHubProps) {
  const [mode, setMode] = useState<UploadMode>("single");

  return (
    <div className="space-y-6">
      <div className="glass-card premium-shadow overflow-hidden rounded-3xl p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-[1.35rem] px-4 py-3 text-sm font-medium transition-all",
              mode === "single"
                ? "vault-gradient text-white shadow-lg"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <CreditCard className="size-4" />
            Single scan
          </button>
          <button
            type="button"
            onClick={() => setMode("bulk")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-[1.35rem] px-4 py-3 text-sm font-medium transition-all",
              mode === "bulk"
                ? "vault-gradient text-white shadow-lg"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Layers className="size-4" />
            Bulk scan
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">{APP_TAGLINE}</p>

      {mode === "single" ? (
        <CardUploadSystem categories={categories} />
      ) : (
        <BulkCardScanSystem categories={categories} />
      )}
    </div>
  );
}
