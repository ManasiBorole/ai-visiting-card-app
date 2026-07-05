"use client";

import { useEffect, useState } from "react";

import type { ContactAnalysisResult, ContactFields } from "@/lib/ai/types";

export function useAiContactAnalysis(
  contact: ContactFields,
  options?: { excludeId?: string; enabled?: boolean; delay?: number }
) {
  const [analysis, setAnalysis] = useState<ContactAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled = options?.enabled ?? true;
  const delay = options?.delay ?? 400;

  useEffect(() => {
    if (!enabled || !contact.name?.trim()) {
      setAnalysis(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact,
            excludeId: options?.excludeId,
          }),
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "AI analysis failed");
        }

        setAnalysis(result.data);
      } catch (analysisError) {
        if (analysisError instanceof DOMException && analysisError.name === "AbortError") {
          return;
        }

        setError(
          analysisError instanceof Error
            ? analysisError.message
            : "AI analysis failed"
        );
        setAnalysis(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, delay);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    contact.name,
    contact.company,
    contact.designation,
    contact.mobile,
    contact.email,
    contact.website,
    contact.gstNumber,
    contact.notes,
    enabled,
    delay,
    options?.excludeId,
  ]);

  return { analysis, loading, error };
}
