"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  CheckCircle2,
  Images,
  Loader2,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

import { GeminiAnalyzingOverlay } from "@/components/extraction/gemini-analyzing-overlay";
import type { PreparedImage } from "@/components/upload/image-slot-uploader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/components/visiting-cards/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BULK_SCAN_MAX_CARDS, ROUTES } from "@/lib/constants";
import {
  compressImageBlob,
  formatFileSize,
  validateImageFile,
} from "@/lib/image-utils";
import {
  extractWithGemini,
  uploadCardImage,
} from "@/lib/upload/client-extract";
import { visitingCardFormSchema } from "@/lib/validations/visiting-card";
import type { ExtractedCardFields } from "@/types/extraction";
import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

type BulkCardScanSystemProps = {
  categories: CategoryOption[];
};

type BulkCardForm = ExtractedCardFields & {
  categoryId: string;
};

type BulkQueueItem = {
  id: string;
  image: PreparedImage;
  savedUrl?: string;
  form: BulkCardForm;
  error?: string;
};

function createId() {
  return crypto.randomUUID();
}

function toForm(extracted: ExtractedCardFields): BulkCardForm {
  return {
    ...extracted,
    categoryId: "",
    alternateMobile: extracted.alternateMobile ?? "",
    city: extracted.city ?? "",
    state: extracted.state ?? "",
    country: extracted.country ?? "",
    pinCode: extracted.pinCode ?? "",
    notes: extracted.notes ?? "",
  };
}

export function BulkCardScanSystem({ categories }: BulkCardScanSystemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<BulkQueueItem[]>([]);
  const [phase, setPhase] = useState<"select" | "review">("select");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    const remaining = BULK_SCAN_MAX_CARDS - queue.length;
    if (remaining <= 0) {
      setError(`Maximum ${BULK_SCAN_MAX_CARDS} cards allowed per bulk scan.`);
      return;
    }

    const selected = files.slice(0, remaining);
    setError(null);

    const newItems: BulkQueueItem[] = [];

    for (const file of selected) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      try {
        const compressed = await compressImageBlob(file);
        const previewUrl = URL.createObjectURL(compressed);
        newItems.push({
          id: createId(),
          image: {
            blob: compressed,
            previewUrl,
            size: compressed.size,
          },
          form: toForm({
            name: "",
            company: "",
            designation: "",
            mobile: "",
            email: "",
            website: "",
            address: "",
            gstNumber: "",
          }),
        });
      } catch {
        setError("Failed to prepare one or more images.");
      }
    }

    if (newItems.length > 0) {
      setQueue((current) => [...current, ...newItems]);
    }
  }

  function removeItem(id: string) {
    setQueue((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item?.image.previewUrl) URL.revokeObjectURL(item.image.previewUrl);
      return current.filter((entry) => entry.id !== id);
    });
  }

  function updateItemForm(id: string, field: keyof BulkCardForm, value: string) {
    setQueue((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, form: { ...item.form, [field]: value }, error: undefined }
          : item
      )
    );
  }

  async function handleProcessAll() {
    if (queue.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setSuccessCount(null);
    setPhase("select");

    const processed: BulkQueueItem[] = [];

    try {
      for (let index = 0; index < queue.length; index += 1) {
        const item = queue[index];
        const cardNumber = index + 1;

        setCurrentIndex(cardNumber);
        setScanStatus(`Processing card ${cardNumber}/${queue.length}`);
        setScanProgress(Math.round((index / queue.length) * 100));

        try {
          const uploaded = item.savedUrl
            ? item
            : {
                ...item,
                image: await uploadCardImage(item.image, "front"),
              };

          const extracted = await extractWithGemini(uploaded.image);

          processed.push({
            ...uploaded,
            savedUrl: uploaded.image.savedUrl,
            form: toForm(extracted),
          });
        } catch (itemError) {
          processed.push({
            ...item,
            error:
              itemError instanceof Error
                ? itemError.message
                : "AI extraction failed. Please try again.",
          });
        }
      }

      setScanProgress(100);
      setQueue(processed);
      setPhase("review");
    } catch (processError) {
      setError(
        processError instanceof Error
          ? processError.message
          : "Bulk scan failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
      setCurrentIndex(0);
    }
  }

  async function handleSaveAll() {
    setIsSavingAll(true);
    setError(null);

    let saved = 0;
    const updatedQueue = [...queue];

    for (let index = 0; index < updatedQueue.length; index += 1) {
      const item = updatedQueue[index];

      if (item.error) continue;

      const parsed = visitingCardFormSchema.safeParse({
        ...item.form,
        categoryId: item.form.categoryId || undefined,
        alternateMobile: item.form.alternateMobile || undefined,
        city: item.form.city || undefined,
        state: item.form.state || undefined,
        country: item.form.country || undefined,
        pinCode: item.form.pinCode || undefined,
        frontImage: item.savedUrl ?? item.image.savedUrl,
      });

      if (!parsed.success) {
        updatedQueue[index] = {
          ...item,
          error: parsed.error.issues[0]?.message ?? "Invalid contact data",
        };
        continue;
      }

      try {
        const response = await fetch("/api/visiting-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...parsed.data,
            categoryId: parsed.data.categoryId || undefined,
            frontImage: item.savedUrl ?? item.image.savedUrl,
            notes: item.form.notes || parsed.data.notes,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          updatedQueue[index] = {
            ...item,
            error: result.error ?? "Failed to save contact",
          };
          continue;
        }

        saved += 1;
        updatedQueue[index] = { ...item, error: undefined };
      } catch {
        updatedQueue[index] = {
          ...item,
          error: "Something went wrong while saving.",
        };
      }
    }

    setQueue(updatedQueue);
    setSuccessCount(saved);
    setIsSavingAll(false);
  }

  return (
    <>
      <GeminiAnalyzingOverlay
        open={isProcessing}
        status={scanStatus}
        progress={scanProgress}
        currentIndex={currentIndex}
        total={queue.length}
      />

      <div className="space-y-6">
        {successCount !== null ? (
          <div
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5"
            role="status"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-400" />
              <div className="space-y-3">
                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                  Saved {successCount} of {queue.length} contacts to CardVault.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href={ROUTES.cards}>
                    <Button size="sm">View all cards</Button>
                  </Link>
                  <Link href={ROUTES.dashboard}>
                    <Button size="sm" variant="outline">
                      Back to dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {phase === "select" ? (
          <>
            <Card className="glass-card premium-shadow overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Images className="size-5 text-primary" />
                  Bulk card queue
                </CardTitle>
                <CardDescription>
                  Upload up to {BULK_SCAN_MAX_CARDS} visiting cards. CardVault AI
                  will process each image with Gemini Vision.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  className="hidden"
                  onChange={handleFilesSelected}
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {queue.length}/{BULK_SCAN_MAX_CARDS} cards selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      disabled={queue.length >= BULK_SCAN_MAX_CARDS || isProcessing}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="size-4" />
                      Add images
                    </Button>
                    <Button
                      type="button"
                      className="gap-2"
                      disabled={queue.length === 0 || isProcessing}
                      onClick={handleProcessAll}
                    >
                      Process all with AI
                    </Button>
                  </div>
                </div>

                {queue.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {queue.map((item, index) => (
                      <div
                        key={item.id}
                        className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/60 p-3 premium-shadow"
                      >
                        <div className="relative mb-3 aspect-[1.586/1] overflow-hidden rounded-xl bg-muted/30">
                          <Image
                            src={item.image.previewUrl}
                            alt={`Card ${index + 1}`}
                            fill
                            className="object-contain p-2"
                            unoptimized
                          />
                          <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatFileSize(item.image.size)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Remove card"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-6 py-12 text-center transition-colors hover:bg-primary/10"
                  >
                    <Upload className="size-8 text-primary" />
                    <div>
                      <p className="font-medium">Drop or select multiple card images</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        JPG, PNG, or WebP — max {BULK_SCAN_MAX_CARDS} at once
                      </p>
                    </div>
                  </button>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="glass-card premium-shadow">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>Review extracted contacts</CardTitle>
                  <CardDescription>
                    Edit each card before saving all contacts to your CRM.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPhase("select")}
                >
                  Back to queue
                </Button>
              </CardHeader>
            </Card>

            <div className="space-y-6">
              {queue.map((item, index) => (
                <Card
                  key={item.id}
                  className={cn(
                    "glass-card premium-shadow overflow-hidden",
                    item.error && "border-destructive/40"
                  )}
                >
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base">
                      Card {index + 1}
                      {item.form.name ? ` — ${item.form.name}` : ""}
                    </CardTitle>
                    {item.error ? (
                      <CardDescription className="text-destructive">
                        {item.error}
                      </CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent className="grid gap-6 pt-4 lg:grid-cols-[200px_1fr]">
                    <div className="relative aspect-[1.586/1] overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                      <Image
                        src={item.image.previewUrl}
                        alt={`Review card ${index + 1}`}
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Name" htmlFor={`bulk-name-${item.id}`} className="sm:col-span-2">
                        <Input
                          id={`bulk-name-${item.id}`}
                          value={item.form.name}
                          onChange={(event) =>
                            updateItemForm(item.id, "name", event.target.value)
                          }
                        />
                      </FormField>
                      <FormField label="Company" htmlFor={`bulk-company-${item.id}`}>
                        <Input
                          id={`bulk-company-${item.id}`}
                          value={item.form.company}
                          onChange={(event) =>
                            updateItemForm(item.id, "company", event.target.value)
                          }
                        />
                      </FormField>
                      <FormField label="Designation" htmlFor={`bulk-designation-${item.id}`}>
                        <Input
                          id={`bulk-designation-${item.id}`}
                          value={item.form.designation}
                          onChange={(event) =>
                            updateItemForm(item.id, "designation", event.target.value)
                          }
                        />
                      </FormField>
                      <FormField label="Phone" htmlFor={`bulk-mobile-${item.id}`}>
                        <Input
                          id={`bulk-mobile-${item.id}`}
                          value={item.form.mobile}
                          onChange={(event) =>
                            updateItemForm(item.id, "mobile", event.target.value)
                          }
                        />
                      </FormField>
                      <FormField label="Email" htmlFor={`bulk-email-${item.id}`}>
                        <Input
                          id={`bulk-email-${item.id}`}
                          value={item.form.email}
                          onChange={(event) =>
                            updateItemForm(item.id, "email", event.target.value)
                          }
                        />
                      </FormField>
                      <FormField label="Website" htmlFor={`bulk-website-${item.id}`}>
                        <Input
                          id={`bulk-website-${item.id}`}
                          value={item.form.website}
                          onChange={(event) =>
                            updateItemForm(item.id, "website", event.target.value)
                          }
                        />
                      </FormField>
                      <FormField label="Address" htmlFor={`bulk-address-${item.id}`} className="sm:col-span-2">
                        <Textarea
                          id={`bulk-address-${item.id}`}
                          value={item.form.address}
                          onChange={(event) =>
                            updateItemForm(item.id, "address", event.target.value)
                          }
                          rows={2}
                        />
                      </FormField>
                      <FormField label="Category" htmlFor={`bulk-category-${item.id}`}>
                        <Select
                          id={`bulk-category-${item.id}`}
                          value={item.form.categoryId}
                          onChange={(event) =>
                            updateItemForm(item.id, "categoryId", event.target.value)
                          }
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                      <FormField label="Notes" htmlFor={`bulk-notes-${item.id}`} className="sm:col-span-2">
                        <Textarea
                          id={`bulk-notes-${item.id}`}
                          value={item.form.notes ?? ""}
                          onChange={(event) =>
                            updateItemForm(item.id, "notes", event.target.value)
                          }
                          rows={2}
                          placeholder="Services, tagline, and extra details"
                        />
                      </FormField>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                className="gap-2"
                disabled={isSavingAll}
                onClick={handleSaveAll}
              >
                {isSavingAll ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving all...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save all contacts
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
