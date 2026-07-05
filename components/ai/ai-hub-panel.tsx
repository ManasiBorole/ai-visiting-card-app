"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Brain,
  Loader2,
  Search,
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
import { duplicateReasonLabel } from "@/lib/ai/duplicate-detection";
import { ROUTES } from "@/lib/constants";

type DuplicateGroup = {
  primaryId: string;
  primaryName: string;
  matches: Array<{
    id: string;
    name: string;
    reason: "email" | "phone" | "name-company";
  }>;
};

export function AiHubPanel() {
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDuplicates() {
    setScanning(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/duplicates");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to scan duplicates");
      }

      setGroups(result.data ?? []);
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Failed to scan duplicates"
      );
    } finally {
      setScanning(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDuplicates();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          {
            icon: AlertTriangle,
            title: "Duplicate card detection",
            description:
              "Finds matching contacts by email, phone, or name + company.",
          },
          {
            icon: Sparkles,
            title: "Auto category suggestion",
            description:
              "Suggests Client, Vendor, Business, or Personal from contact context.",
          },
          {
            icon: Brain,
            title: "Contact summary",
            description:
              "Generates readable summaries on every contact detail page.",
          },
          {
            icon: Search,
            title: "Smart search",
            description:
              'Understands queries like "clients in Mumbai" or "CEO contacts".',
          },
          {
            icon: Wand2,
            title: "Smart field corrections",
            description:
              "Suggests fixes for common typos in email, phone, GST, and website fields.",
          },
          {
            icon: Brain,
            title: "Business type detection",
            description:
              "Identifies SaaS, agency, healthcare, retail, and other business types.",
          },
        ].map((feature) => (
          <Card key={feature.title} className="border-border/60 shadow-sm">
            <CardHeader>
              <feature.icon className="size-5 text-primary" />
              <CardTitle className="text-base">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Duplicate scan</CardTitle>
            <CardDescription>
              AI scan across your full contact library
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={loadDuplicates}
            disabled={scanning}
          >
            {scanning ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Rescan
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="py-8 text-center text-sm text-destructive">{error}</p>
          ) : loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Scanning contacts...
            </div>
          ) : groups.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No duplicate contacts detected in your library.
            </p>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <div
                  key={group.primaryId}
                  className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{group.primaryName}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.matches.length} possible duplicate
                        {group.matches.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Link href={ROUTES.cardDetail(group.primaryId)}>
                      <Button type="button" size="sm" variant="outline">
                        Review
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.matches.map((match) => (
                      <Badge key={match.id} variant="secondary">
                        {match.name} · {duplicateReasonLabel(match.reason)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
