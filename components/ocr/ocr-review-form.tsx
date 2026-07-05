"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { AiContactInsights } from "@/components/ai/ai-contact-insights";
import { FormField } from "@/components/visiting-cards/form-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { visitingCardFormSchema } from "@/lib/validations/visiting-card";
import { ROUTES } from "@/lib/constants";
import type { ExtractedCardFields } from "@/types/ocr";
import { useAiContactAnalysis } from "@/hooks/use-ai-contact-analysis";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

type OcrReviewFormProps = {
  extracted: ExtractedCardFields;
  frontImageUrl?: string;
  backImageUrl?: string;
  categories: CategoryOption[];
  onRescan: () => void;
};

type ReviewFormState = ExtractedCardFields & {
  categoryId: string;
  notes: string;
};

export function OcrReviewForm({
  extracted,
  frontImageUrl,
  backImageUrl,
  categories,
  onRescan,
}: OcrReviewFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ReviewFormState>({
    ...extracted,
    categoryId: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { analysis, loading: aiLoading, error: aiError } = useAiContactAnalysis(
    {
      name: form.name,
      company: form.company,
      designation: form.designation,
      mobile: form.mobile,
      email: form.email,
      website: form.website,
      address: form.address,
      gstNumber: form.gstNumber,
      notes: form.notes,
    },
    { enabled: Boolean(form.name.trim()) }
  );

  function updateField<K extends keyof ReviewFormState>(
    field: K,
    value: ReviewFormState[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const parsed = visitingCardFormSchema.safeParse({
      ...form,
      categoryId: form.categoryId || undefined,
      alternateMobile: undefined,
      city: undefined,
      state: undefined,
      pinCode: undefined,
      frontImage: frontImageUrl,
      backImage: backImageUrl,
    });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/visiting-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          categoryId: parsed.data.categoryId || undefined,
          frontImage: frontImageUrl,
          backImage: backImageUrl,
          notes: form.notes || parsed.data.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          const apiErrors = result.errors as Record<string, string[]>;
          const fieldErrors: Partial<Record<string, string>> = {};
          for (const [key, messages] of Object.entries(apiErrors)) {
            fieldErrors[key] = messages[0];
          }
          setErrors(fieldErrors);
        }
        setFormError(result.error ?? "Failed to save visiting card");
        return;
      }

      setSuccessMessage(
        result.message ?? "Visiting card saved successfully from OCR scan"
      );
      router.refresh();
    } catch {
      setFormError("Something went wrong while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6" noValidate>
      {successMessage ? (
        <div
          className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5"
          role="status"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-3">
              <div>
                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                  {successMessage}
                </p>
                <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-300/80">
                  OCR extracted data has been saved to your CRM library.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={ROUTES.cards}>
                  <Button type="button" size="sm">
                    View all cards
                  </Button>
                </Link>
                <Link href={ROUTES.dashboard}>
                  <Button type="button" size="sm" variant="outline">
                    Back to dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {formError ? (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      <AiContactInsights
        analysis={analysis}
        loading={aiLoading}
        error={aiError}
        showOcrCorrections
        onApplyCategory={(categoryId) => updateField("categoryId", categoryId)}
        onApplyCorrection={(field, value) =>
          updateField(field as keyof ReviewFormState, value)
        }
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Extracted data preview</CardTitle>
            <CardDescription>
              Review and edit OCR results before saving to the database
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onRescan}>
            Rescan
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="space-y-3">
            {frontImageUrl ? (
              <div className="relative aspect-[1.586/1] overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                <Image
                  src={frontImageUrl}
                  alt="Scanned front"
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
                <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  Front
                </span>
              </div>
            ) : null}
            {backImageUrl ? (
              <div className="relative aspect-[1.586/1] overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                <Image
                  src={backImageUrl}
                  alt="Scanned back"
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
                <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  Back
                </span>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Name"
              htmlFor="ocr-name"
              required
              error={errors.name}
              className="sm:col-span-2"
            >
              <Input
                id="ocr-name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </FormField>

            <FormField label="Company" htmlFor="ocr-company" error={errors.company}>
              <Input
                id="ocr-company"
                value={form.company}
                onChange={(event) => updateField("company", event.target.value)}
              />
            </FormField>

            <FormField
              label="Designation"
              htmlFor="ocr-designation"
              error={errors.designation}
            >
              <Input
                id="ocr-designation"
                value={form.designation}
                onChange={(event) =>
                  updateField("designation", event.target.value)
                }
              />
            </FormField>

            <FormField label="Mobile" htmlFor="ocr-mobile" error={errors.mobile}>
              <Input
                id="ocr-mobile"
                value={form.mobile}
                onChange={(event) => updateField("mobile", event.target.value)}
              />
            </FormField>

            <FormField label="Email" htmlFor="ocr-email" error={errors.email}>
              <Input
                id="ocr-email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </FormField>

            <FormField label="Website" htmlFor="ocr-website" error={errors.website}>
              <Input
                id="ocr-website"
                value={form.website}
                onChange={(event) => updateField("website", event.target.value)}
              />
            </FormField>

            <FormField label="GST number" htmlFor="ocr-gst" error={errors.gstNumber}>
              <Input
                id="ocr-gst"
                value={form.gstNumber}
                onChange={(event) =>
                  updateField("gstNumber", event.target.value)
                }
              />
            </FormField>

            <FormField
              label="Address"
              htmlFor="ocr-address"
              error={errors.address}
              className="sm:col-span-2"
            >
              <Textarea
                id="ocr-address"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                rows={3}
              />
            </FormField>

            <FormField label="Category" htmlFor="ocr-category" error={errors.categoryId}>
              <Select
                id="ocr-category"
                value={form.categoryId}
                onChange={(event) => updateField("categoryId", event.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              label="Notes"
              htmlFor="ocr-notes"
              error={errors.notes}
              className="sm:col-span-2"
            >
              <Textarea
                id="ocr-notes"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                rows={2}
                placeholder="Optional notes from OCR review"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={ROUTES.cardsNew}>
          <Button type="button" variant="outline" disabled={isSaving}>
            Edit in full form
          </Button>
        </Link>
        <Button type="submit" className="gap-2" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save to database
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
