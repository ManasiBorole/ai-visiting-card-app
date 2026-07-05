"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Brain,
  Building2,
  FolderOpen,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ContactAnalysisResult, ContactFields } from "@/lib/ai/types";
import {
  confidenceLabel,
  duplicateReasonLabel,
} from "@/lib/ai/duplicate-detection";
import { ROUTES } from "@/lib/constants";

type AiContactInsightsProps = {
  analysis: ContactAnalysisResult | null;
  loading?: boolean;
  error?: string | null;
  onApplyCategory?: (categoryId: string) => void;
  onApplyCorrection?: (field: keyof ContactFields, value: string) => void;
  showOcrCorrections?: boolean;
};

export function AiContactInsights({
  analysis,
  loading,
  error,
  onApplyCategory,
  onApplyCorrection,
  showOcrCorrections = false,
}: AiContactInsightsProps) {
  if (loading) {
    return (
      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="flex items-center gap-3 py-6">
          <Loader2 className="size-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Running AI analysis...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
        <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const hasInsights =
    analysis.duplicates.length > 0 ||
    analysis.categorySuggestion ||
    analysis.businessType ||
    (showOcrCorrections && analysis.ocrCorrections.length > 0);

  if (!hasInsights) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="size-4 text-primary" />
          AI insights
        </CardTitle>
        <CardDescription>
          Smart suggestions powered by Visiting Card AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis.duplicates.length > 0 ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
              <AlertTriangle className="size-4" />
              Duplicate card detected
            </div>
            <div className="space-y-2">
              {analysis.duplicates.map((duplicate) => (
                <div
                  key={`${duplicate.id}-${duplicate.reason}`}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{duplicate.name}</p>
                    <p className="text-muted-foreground">
                      {duplicateReasonLabel(duplicate.reason)} ·{" "}
                      {confidenceLabel(duplicate.confidence)} confidence
                    </p>
                  </div>
                  <Link href={ROUTES.cardDetail(duplicate.id)}>
                    <Button type="button" size="sm" variant="outline">
                      View match
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {analysis.businessType ? (
          <div className="rounded-xl border border-border/60 bg-background/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Building2 className="size-4 text-primary" />
              Business type detection
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{analysis.businessType.type}</Badge>
              <span className="text-xs text-muted-foreground">
                {confidenceLabel(analysis.businessType.confidence)} confidence
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Signals: {analysis.businessType.signals.join(", ")}
            </p>
          </div>
        ) : null}

        {analysis.categorySuggestion ? (
          <div className="rounded-xl border border-border/60 bg-background/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FolderOpen className="size-4 text-primary" />
              Suggested category
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                style={{
                  borderColor: `${analysis.categorySuggestion.color}40`,
                  color: analysis.categorySuggestion.color,
                  backgroundColor: `${analysis.categorySuggestion.color}12`,
                }}
              >
                {analysis.categorySuggestion.categoryName}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {analysis.categorySuggestion.reason}
              </span>
            </div>
            {onApplyCategory ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3 gap-2"
                onClick={() =>
                  onApplyCategory(analysis.categorySuggestion!.categoryId)
                }
              >
                <Sparkles className="size-3.5" />
                Apply category
              </Button>
            ) : null}
          </div>
        ) : null}

        {showOcrCorrections && analysis.ocrCorrections.length > 0 ? (
          <div className="rounded-xl border border-border/60 bg-background/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Wand2 className="size-4 text-primary" />
              OCR correction suggestions
            </div>
            <div className="space-y-2">
              {analysis.ocrCorrections.map((correction) => (
                <div
                  key={`${correction.field}-${correction.suggested}`}
                  className="rounded-lg border border-border/60 px-3 py-2 text-sm"
                >
                  <p className="font-medium capitalize">{correction.field}</p>
                  <p className="text-muted-foreground">
                    {correction.current} → {correction.suggested}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {correction.reason}
                  </p>
                  {onApplyCorrection ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="mt-1 h-7 px-2"
                      onClick={() =>
                        onApplyCorrection(correction.field, correction.suggested)
                      }
                    >
                      Apply fix
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
