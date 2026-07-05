"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { FormField } from "@/components/visiting-cards/form-field";
import { AiContactInsights } from "@/components/ai/ai-contact-insights";
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
import { useAiContactAnalysis } from "@/hooks/use-ai-contact-analysis";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

type FormState = {
  name: string;
  company: string;
  designation: string;
  mobile: string;
  alternateMobile: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  gstNumber: string;
  categoryId: string;
  notes: string;
};

const initialFormState: FormState = {
  name: "",
  company: "",
  designation: "",
  mobile: "",
  alternateMobile: "",
  email: "",
  website: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  gstNumber: "",
  categoryId: "",
  notes: "",
};

type AddVisitingCardFormProps = {
  categories: CategoryOption[];
  initialFrontImage?: string;
  initialBackImage?: string;
};

export function AddVisitingCardForm({
  categories,
  initialFrontImage,
  initialBackImage,
}: AddVisitingCardFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [frontImage, setFrontImage] = useState(initialFrontImage ?? "");
  const [backImage, setBackImage] = useState(initialBackImage ?? "");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savedCardName, setSavedCardName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { analysis, loading: aiLoading, error: aiError } = useAiContactAnalysis(
    {
      name: form.name,
      company: form.company,
      designation: form.designation,
      mobile: form.mobile,
      email: form.email,
      website: form.website,
      address: form.address,
      city: form.city,
      state: form.state,
      gstNumber: form.gstNumber,
      notes: form.notes,
    },
    { enabled: Boolean(form.name.trim()) }
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
    setSuccessMessage(null);
  }

  function handleCancel() {
    router.push(ROUTES.cards);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const parsed = visitingCardFormSchema.safeParse(form);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FormState;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/visiting-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          categoryId: parsed.data.categoryId || undefined,
          frontImage: frontImage || undefined,
          backImage: backImage || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          const apiErrors = result.errors as Record<string, string[]>;
          const fieldErrors: Partial<Record<keyof FormState, string>> = {};

          for (const [key, messages] of Object.entries(apiErrors)) {
            fieldErrors[key as keyof FormState] = messages[0];
          }

          setErrors(fieldErrors);
        }

        setFormError(result.error ?? "Failed to save visiting card");
        return;
      }

      setSuccessMessage(result.message ?? "Visiting card saved successfully");
      setSavedCardName(parsed.data.name);
      setForm(initialFormState);
      setFrontImage("");
      setBackImage("");
      setErrors({});
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {successMessage ? (
        <div
          className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {successMessage}
            </p>
            {savedCardName ? (
              <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
                <span className="font-medium">{savedCardName}</span> has been
                added to your CRM library.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href={ROUTES.cards}>
                <Button type="button" size="sm" variant="outline">
                  View all cards
                </Button>
              </Link>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSuccessMessage(null);
                  setSavedCardName(null);
                }}
              >
                Add another
              </Button>
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
        onApplyCategory={(categoryId) => updateField("categoryId", categoryId)}
      />

      {frontImage || backImage ? (
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Attached images</CardTitle>
            <CardDescription>
              Card images uploaded from the upload module
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {frontImage ? (
              <div className="relative h-28 w-44 overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                <Image
                  src={frontImage}
                  alt="Front card"
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
                <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  Front
                </span>
              </div>
            ) : null}
            {backImage ? (
              <div className="relative h-28 w-44 overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                <Image
                  src={backImage}
                  alt="Back card"
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
                <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  Back
                </span>
              </div>
            ) : null}
            <Link href={ROUTES.upload}>
              <Button type="button" variant="outline" size="sm" className="self-end">
                Change images
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Contact details</CardTitle>
          <CardDescription>Primary information from the visiting card</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Name"
            htmlFor="name"
            required
            error={errors.name}
            className="sm:col-span-2"
          >
            <Input
              id="name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Full name"
              autoComplete="name"
            />
          </FormField>

          <FormField label="Company" htmlFor="company" error={errors.company}>
            <Input
              id="company"
              value={form.company}
              onChange={(event) => updateField("company", event.target.value)}
              placeholder="Company name"
            />
          </FormField>

          <FormField
            label="Designation"
            htmlFor="designation"
            error={errors.designation}
          >
            <Input
              id="designation"
              value={form.designation}
              onChange={(event) => updateField("designation", event.target.value)}
              placeholder="Job title"
            />
          </FormField>

          <FormField label="Phone" htmlFor="mobile" error={errors.mobile}>
            <Input
              id="mobile"
              type="tel"
              value={form.mobile}
              onChange={(event) => updateField("mobile", event.target.value)}
              placeholder="+91 98765 43210"
            />
          </FormField>

          <FormField
            label="Alternative phone"
            htmlFor="alternateMobile"
            error={errors.alternateMobile}
          >
            <Input
              id="alternateMobile"
              type="tel"
              value={form.alternateMobile}
              onChange={(event) =>
                updateField("alternateMobile", event.target.value)
              }
              placeholder="Secondary number"
            />
          </FormField>

          <FormField label="Email" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="email@company.com"
            />
          </FormField>

          <FormField label="Website" htmlFor="website" error={errors.website}>
            <Input
              id="website"
              type="url"
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
              placeholder="https://company.com"
            />
          </FormField>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Address</CardTitle>
          <CardDescription>Location details for this contact</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Address"
            htmlFor="address"
            error={errors.address}
            className="sm:col-span-2"
          >
            <Textarea
              id="address"
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Street address"
              rows={3}
            />
          </FormField>

          <FormField label="City" htmlFor="city" error={errors.city}>
            <Input
              id="city"
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              placeholder="City"
            />
          </FormField>

          <FormField label="State" htmlFor="state" error={errors.state}>
            <Input
              id="state"
              value={form.state}
              onChange={(event) => updateField("state", event.target.value)}
              placeholder="State"
            />
          </FormField>

          <FormField label="PIN" htmlFor="pinCode" error={errors.pinCode}>
            <Input
              id="pinCode"
              value={form.pinCode}
              onChange={(event) => updateField("pinCode", event.target.value)}
              placeholder="PIN code"
            />
          </FormField>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Business & notes</CardTitle>
          <CardDescription>Tax, category, and additional information</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="GST" htmlFor="gstNumber" error={errors.gstNumber}>
            <Input
              id="gstNumber"
              value={form.gstNumber}
              onChange={(event) => updateField("gstNumber", event.target.value)}
              placeholder="22AAAAA0000A1Z5"
            />
          </FormField>

          <FormField
            label="Category"
            htmlFor="categoryId"
            error={errors.categoryId}
          >
            <Select
              id="categoryId"
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
            htmlFor="notes"
            error={errors.notes}
            className="sm:col-span-2"
          >
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Meeting context, follow-ups, or other notes..."
              rows={4}
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save card"
          )}
        </Button>
      </div>
    </form>
  );
}
