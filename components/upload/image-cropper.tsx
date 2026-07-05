"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Check, RotateCw, X, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CARD_ASPECT_RATIO,
  compressImageBlob,
  getCroppedImageBlob,
} from "@/lib/image-utils";

type ImageCropperProps = {
  imageSrc: string;
  open: boolean;
  onClose: () => void;
  onComplete: (blob: Blob, previewUrl: string, size: number) => void;
  title?: string;
};

export function ImageCropper({
  imageSrc,
  open,
  onClose,
  onComplete,
  title = "Crop visiting card",
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  async function handleApplyCrop() {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);

    try {
      const croppedBlob = await getCroppedImageBlob(
        imageSrc,
        croppedAreaPixels,
        rotation,
        "image/jpeg",
        0.92
      );
      const compressedBlob = await compressImageBlob(croppedBlob);
      const previewUrl = URL.createObjectURL(compressedBlob);

      onComplete(compressedBlob, previewUrl, compressedBlob.size);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-6">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">
              Adjust crop and zoom for best results
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close cropper"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="relative h-[320px] bg-black sm:h-[420px]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={CARD_ASPECT_RATIO}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            objectFit="contain"
          />
        </div>

        <div className="space-y-4 border-t border-border/60 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <ZoomIn className="size-4" />
                Zoom
              </span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full accent-primary"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <RotateCw className="size-4" />
                Rotation
              </span>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(event) => setRotation(Number(event.target.value))}
                className="w-full accent-primary"
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              className="gap-2"
              disabled={isProcessing}
              onClick={handleApplyCrop}
            >
              <Check className="size-4" />
              {isProcessing ? "Processing..." : "Apply crop & compress"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
