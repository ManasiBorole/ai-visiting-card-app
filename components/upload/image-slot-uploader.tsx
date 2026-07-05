"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";

import { CameraCapture } from "@/components/upload/camera-capture";
import { ImageCropper } from "@/components/upload/image-cropper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFileSize, validateImageFile } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

export type PreparedImage = {
  blob: Blob;
  previewUrl: string;
  size: number;
  savedUrl?: string;
};

type ImageSlotUploaderProps = {
  label: string;
  side: "front" | "back";
  value: PreparedImage | null;
  onChange: (value: PreparedImage | null) => void;
  disabled?: boolean;
};

export function ImageSlotUploader({
  label,
  side,
  value,
  onChange,
  disabled,
}: ImageSlotUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(file: File) {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setCropSource(objectUrl);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleFileSelect(file);
    event.target.value = "";
  }

  function handleCropComplete(blob: Blob, previewUrl: string, size: number) {
    if (cropSource) URL.revokeObjectURL(cropSource);
    if (value?.previewUrl) URL.revokeObjectURL(value.previewUrl);

    setCropSource(null);
    onChange({ blob, previewUrl, size });
  }

  function handleRemove() {
    if (value?.previewUrl) URL.revokeObjectURL(value.previewUrl);
    onChange(null);
    setError(null);
  }

  return (
    <>
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all",
          value ? "border-primary/30" : "border-border/60 border-dashed",
          disabled && "opacity-60"
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div>
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground capitalize">{side} side</p>
          </div>
          {value ? (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="size-3" />
              Ready
            </Badge>
          ) : null}
        </div>

        {value ? (
          <div className="relative aspect-[1.586/1] bg-muted/30">
            <Image
              src={value.savedUrl ?? value.previewUrl}
              alt={`${label} preview`}
              fill
              className="object-contain p-3"
              unoptimized
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <span className="text-xs">{formatFileSize(value.size)}</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-8 gap-1"
                  disabled={disabled}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <RefreshCw className="size-3.5" />
                  Replace
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-8"
                  disabled={disabled}
                  onClick={handleRemove}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex aspect-[1.586/1] flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ImagePlus className="size-7" />
            </div>
            <div>
              <p className="font-medium">Upload {label.toLowerCase()}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag, browse, or capture with camera
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                Browse
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={disabled}
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="size-4" />
                Mobile camera
              </Button>
              <Button
                type="button"
                className="gap-2"
                disabled={disabled}
                onClick={() => setCameraOpen(true)}
              >
                <Camera className="size-4" />
                Live capture
              </Button>
            </div>
          </div>
        )}

        {error ? (
          <p className="px-4 pb-4 text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleFileSelect}
        title={`Capture ${label.toLowerCase()}`}
      />

      {cropSource ? (
        <ImageCropper
          imageSrc={cropSource}
          open={Boolean(cropSource)}
          onClose={() => {
            URL.revokeObjectURL(cropSource);
            setCropSource(null);
          }}
          onComplete={handleCropComplete}
          title={`Crop ${label.toLowerCase()}`}
        />
      ) : null}
    </>
  );
}
