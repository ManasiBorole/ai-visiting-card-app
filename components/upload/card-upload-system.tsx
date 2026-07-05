"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";

import { CardExtractionReviewForm } from "@/components/extraction/card-extraction-review-form";
import { GeminiAnalyzingOverlay } from "@/components/extraction/gemini-analyzing-overlay";
import {
  ImageSlotUploader,
  type PreparedImage,
} from "@/components/upload/image-slot-uploader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_TAGLINE } from "@/lib/constants";
import { formatFileSize } from "@/lib/image-utils";
import { ROUTES } from "@/lib/constants";
import {
  extractWithGemini,
  uploadCardImage,
} from "@/lib/upload/client-extract";
import type { ExtractedCardFields } from "@/types/extraction";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

type CardUploadSystemProps = {
  categories: CategoryOption[];
};

export function CardUploadSystem({ categories }: CardUploadSystemProps) {
  const [frontImage, setFrontImage] = useState<PreparedImage | null>(null);
  const [backImage, setBackImage] = useState<PreparedImage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStatus, setScanStatus] = useState(
    "Understanding company, person, address and details"
  );
  const [scanProgress, setScanProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savedUrls, setSavedUrls] = useState<{
    front?: string;
    back?: string;
  }>({});
  const [extractedData, setExtractedData] = useState<ExtractedCardFields | null>(
    null
  );
  const [showReview, setShowReview] = useState(false);

  const canSave = Boolean(frontImage || backImage);
  const canExtract = Boolean(frontImage);
  const hasSaved = Boolean(savedUrls.front || savedUrls.back);

  async function ensureImagesUploaded() {
    const uploads: { front?: string; back?: string } = { ...savedUrls };

    if (frontImage && !frontImage.savedUrl && !uploads.front) {
      const saved = await uploadCardImage(frontImage, "front");
      setFrontImage(saved);
      uploads.front = saved.savedUrl;
    } else if (frontImage?.savedUrl) {
      uploads.front = frontImage.savedUrl;
    }

    if (backImage && !backImage.savedUrl && !uploads.back) {
      const saved = await uploadCardImage(backImage, "back");
      setBackImage(saved);
      uploads.back = saved.savedUrl;
    } else if (backImage?.savedUrl) {
      uploads.back = backImage.savedUrl;
    }

    setSavedUrls(uploads);
    return uploads;
  }

  async function handleSaveImages() {
    if (!canSave) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await ensureImagesUploaded();
      setSuccessMessage("Card images saved successfully.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to save images"
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleExtractDetails() {
    if (!frontImage) return;

    setIsAnalyzing(true);
    setShowReview(false);
    setExtractedData(null);
    setError(null);
    setScanProgress(10);
    setScanStatus("Uploading images...");

    try {
      const uploads = await ensureImagesUploaded();

      setScanProgress(35);
      setScanStatus("Understanding company, person, address and details");

      const extracted = await extractWithGemini(frontImage, backImage);

      setScanProgress(100);
      setSavedUrls(uploads);
      setExtractedData(extracted);
      setShowReview(true);
    } catch (extractError) {
      setError(
        extractError instanceof Error
          ? extractError.message
          : "AI extraction failed. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  const continueHref = (() => {
    const params = new URLSearchParams();
    const front = savedUrls.front ?? frontImage?.savedUrl;
    const back = savedUrls.back ?? backImage?.savedUrl;
    if (front) params.set("frontImage", front);
    if (back) params.set("backImage", back);
    const query = params.toString();
    return query ? `${ROUTES.cardsNew}?${query}` : ROUTES.cardsNew;
  })();

  return (
    <>
      <GeminiAnalyzingOverlay
        open={isAnalyzing}
        status={scanStatus}
        progress={scanProgress}
      />

      <div className="space-y-6">
        <Card className="glass-card premium-shadow overflow-hidden">
          <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" />
                CardVault AI · Gemini Vision
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Upload, analyze, review, and save
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {APP_TAGLINE} Upload card images and let CardVault AI read the
                complete visiting card before saving to your CRM.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/60 px-3 py-1">
                Gemini 2.5 Flash
              </span>
              <span className="rounded-full border border-border/60 px-3 py-1">
                Vision analysis
              </span>
              <span className="rounded-full border border-border/60 px-3 py-1">
                Crop & compress
              </span>
            </div>
          </CardContent>
        </Card>

        {successMessage ? (
          <div
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5"
            role="status"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1 space-y-4">
                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                  {successMessage}
                </p>
                <Link href={continueHref}>
                  <Button className="gap-2">
                    Continue to add details
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
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

        {!showReview ? (
          <>
            <div className="grid gap-6 xl:grid-cols-2">
              <ImageSlotUploader
                label="Front image"
                side="front"
                value={frontImage}
                onChange={setFrontImage}
                disabled={isSaving || isAnalyzing}
              />
              <ImageSlotUploader
                label="Back image"
                side="back"
                value={backImage}
                onChange={setBackImage}
                disabled={isSaving || isAnalyzing}
              />
            </div>

            <Card className="border-primary/20 bg-primary/5 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="size-5 text-primary" />
                  Gemini AI extraction
                </CardTitle>
                <CardDescription>
                  Gemini Vision analyzes the full card image and returns
                  structured JSON for review.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {canExtract
                    ? "Ready to analyze. Back image helps fill missing fields."
                    : "Add a front image to start Gemini AI extraction."}
                </p>
                <Button
                  type="button"
                  className="gap-2"
                  disabled={!canExtract || isAnalyzing || isSaving}
                  onClick={handleExtractDetails}
                >
                  <Brain className="size-4" />
                  Extract & preview
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Upload summary</CardTitle>
                <CardDescription>
                  Save images only, or extract first to preview contact data
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    Front:{" "}
                    <span className="font-medium text-foreground">
                      {frontImage ? formatFileSize(frontImage.size) : "Not added"}
                    </span>
                  </p>
                  <p>
                    Back:{" "}
                    <span className="font-medium text-foreground">
                      {backImage ? formatFileSize(backImage.size) : "Not added"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link href={ROUTES.cardsNew}>
                    <Button type="button" variant="outline" disabled={isSaving}>
                      Skip images
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    className="gap-2"
                    variant="outline"
                    disabled={!canSave || isSaving || isAnalyzing}
                    onClick={handleSaveImages}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        Save images only
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {hasSaved ? (
              <Card className="border-border/60 shadow-sm">
                <CardContent className="flex flex-wrap gap-4 p-5">
                  {savedUrls.front ? (
                    <div className="relative h-24 w-36 overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                      <Image
                        src={savedUrls.front}
                        alt="Saved front"
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    </div>
                  ) : null}
                  {savedUrls.back ? (
                    <div className="relative h-24 w-36 overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                      <Image
                        src={savedUrls.back}
                        alt="Saved back"
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : extractedData ? (
          <CardExtractionReviewForm
            extracted={extractedData}
            frontImageUrl={savedUrls.front ?? frontImage?.savedUrl}
            backImageUrl={savedUrls.back ?? backImage?.savedUrl}
            categories={categories}
            onReanalyze={() => {
              setShowReview(false);
              setExtractedData(null);
              handleExtractDetails();
            }}
          />
        ) : null}
      </div>
    </>
  );
}
