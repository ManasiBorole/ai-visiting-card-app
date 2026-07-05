"use client";

import { useEffect, useState } from "react";
import { Brain, Loader2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ContactSummaryResult } from "@/lib/ai/types";
import { confidenceLabel } from "@/lib/ai/duplicate-detection";

type AiContactSummaryCardProps = {
  contactId: string;
};

export function AiContactSummaryCard({ contactId }: AiContactSummaryCardProps) {
  const [summary, setSummary] = useState<ContactSummaryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/ai/summary/${contactId}`, {
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Failed to load summary");
        }

        setSummary(result.data);
      } catch (summaryError) {
        if (summaryError instanceof DOMException && summaryError.name === "AbortError") {
          return;
        }

        setError(
          summaryError instanceof Error
            ? summaryError.message
            : "Failed to load summary"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    return () => controller.abort();
  }, [contactId]);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="size-4 text-primary" />
          AI contact summary
        </CardTitle>
        <CardDescription>
          Auto-generated overview of this contact
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Generating summary...
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : summary ? (
          <div className="space-y-4">
            <p className="text-sm leading-7 text-foreground">{summary.summary}</p>

            {summary.highlights.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {summary.highlights.map((highlight) => (
                  <Badge key={highlight} variant="secondary">
                    {highlight}
                  </Badge>
                ))}
              </div>
            ) : null}

            {summary.businessType ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Sparkles className="size-4 text-primary" />
                <span className="font-medium">{summary.businessType.type}</span>
                <span className="text-xs text-muted-foreground">
                  {confidenceLabel(summary.businessType.confidence)} confidence
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
