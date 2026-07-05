"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Save,
  ScanLine,
  Sparkles,
} from "lucide-react";

import { OcrReviewForm } from "@/components/ocr/ocr-review-form";
import { OcrScanningOverlay } from "@/components/ocr/ocr-scanning-overlay";
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
import {
  mergeExtractedFields,
  parseCardText,
} from "@/lib/ocr/parse-card-text";
import { runOcrOnImage } from "@/lib/ocr/run-ocr";
import { formatFileSize } from "@/lib/image-utils";
import { ROUTES } from "@/lib/constants";
import type { ExtractedCardFields } from "@/types/ocr";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

type CardUploadSystemProps = {
  categories: CategoryOption[];
};

async function uploadImageSide(
  image: PreparedImage,
  side: "front" | "back"
): Promise<PreparedImage> {
  const formData = new FormData();
  formData.append(
    "file",
    new File([image.blob], `${side}-card.jpg`, { type: "image/jpeg" })
  );
  formData.append("side", side);

  const response = await fetch("/api/upload/card-image", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? `Failed to upload ${side} image`);
  }

  return {
    ...image,
    savedUrl: result.data.url as string,
  };
}

export function CardUploadSystem({ categories }: CardUploadSystemProps) {
  const [frontImage, setFrontImage] = useState<PreparedImage | null>(null);
  const [backImage, setBackImage] = useState<PreparedImage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("Preparing scan...");
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
  const canScan = Boolean(frontImage);
  const hasSaved = Boolean(savedUrls.front || savedUrls.back);

  async function ensureImagesUploaded() {
    const uploads: { front?: string; back?: string } = { ...savedUrls };

    if (frontImage && !frontImage.savedUrl && !uploads.front) {
      const saved = await uploadImageSide(frontImage, "front");
      setFrontImage(saved);
      uploads.front = saved.savedUrl;
    } else if (frontImage?.savedUrl) {
      uploads.front = frontImage.savedUrl;
    }

    if (backImage && !backImage.savedUrl && !uploads.back) {
      const saved = await uploadImageSide(backImage, "back");
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

  async function handleScanOcr() {
    if (!frontImage) return;

    setIsScanning(true);
    setShowReview(false);
    setExtractedData(null);
    setError(null);
    setScanStatus("Uploading images...");
    setScanProgress(8);

    try {
      const uploads = await ensureImagesUploaded();

      setScanStatus("Scanning front side...");
      setScanProgress(15);

      const frontText = await runOcrOnImage(frontImage.blob, (progress) => {
        setScanStatus(progress.status);
        setScanProgress(Math.min(progress.progress, backImage ? 55 : 90));
      });

      let extracted = parseCardText(frontText);

      if (backImage) {
        setScanStatus("Scanning back side...");
        setScanProgress(60);

        const backText = await runOcrOnImage(backImage.blob, (progress) => {
          setScanStatus(progress.status);
          setScanProgress(60 + Math.round(progress.progress * 0.35));
        });

        extracted = mergeExtractedFields(extracted, parseCardText(backText));
      }

      setSavedUrls(uploads);
      setExtractedData(extracted);
      setShowReview(true);
      setScanProgress(100);
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "OCR scan failed. Please try again."
      );
    } finally {
      setIsScanning(false);
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
      <OcrScanningOverlay
        open={isScanning}
        status={scanStatus}
        progress={scanProgress}
      />

      <div className="space-y-6">
        <Card className="overflow-hidden border-border/60 bg-gradient-to-r from-primary/10 via-background to-background shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                OCR-powered upload
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Upload, scan, review, and save
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Upload card images, extract contact details with Tesseract.js OCR,
                edit the preview, and save directly to your CRM database.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/60 px-3 py-1">
                Tesseract OCR
              </span>
              <span className="rounded-full border border-border/60 px-3 py-1">
                Crop & compress
              </span>
              <span className="rounded-full border border-border/60 px-3 py-1">
                Mobile camera
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
                disabled={isSaving || isScanning}
              />
              <ImageSlotUploader
                label="Back image"
                side="back"
                value={backImage}
                onChange={setBackImage}
                disabled={isSaving || isScanning}
              />
            </div>

            <Card className="border-primary/20 bg-primary/5 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScanLine className="size-5 text-primary" />
                  OCR scan
                </CardTitle>
                <CardDescription>
                  Scan the front image to extract name, company, phone, email,
                  website, address, and GST number
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {canScan
                    ? "Ready to scan. Back image will be used to fill missing fields."
                    : "Add a front image to enable OCR scanning."}
                </p>
                <Button
                  type="button"
                  className="gap-2"
                  disabled={!canScan || isScanning || isSaving}
                  onClick={handleScanOcr}
                >
                  <ScanLine className="size-4" />
                  Scan & extract details
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Upload summary</CardTitle>
                <CardDescription>
                  Save images only, or scan first to extract contact data
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
                    disabled={!canSave || isSaving || isScanning}
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
          <OcrReviewForm
            extracted={extractedData}
            frontImageUrl={savedUrls.front ?? frontImage?.savedUrl}
            backImageUrl={savedUrls.back ?? backImage?.savedUrl}
            categories={categories}
            onRescan={() => {
              setShowReview(false);
              setExtractedData(null);
              handleScanOcr();
            }}
          />
        ) : null}
      </div>
    </>
  );
}
