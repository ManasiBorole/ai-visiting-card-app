"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CameraCaptureProps = {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
};

export function CameraCapture({
  open,
  onClose,
  onCapture,
  title = "Capture card photo",
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError(
        "Camera access denied or unavailable. Use gallery upload instead."
      );
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [open, startCamera, stopCamera]);

  function handleCapture() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `camera-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        onCapture(file);
        onClose();
      },
      "image/jpeg",
      0.92
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <Card className="w-full max-w-lg overflow-hidden border-border/60 shadow-2xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Position the card in frame and capture a clear photo
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close camera"
          >
            <X className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-black">
            {error ? (
              <div className="flex min-h-[240px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
                {error}
              </div>
            ) : (
              <video
                ref={videoRef}
                className="aspect-[4/3] w-full object-cover"
                playsInline
                muted
                autoPlay
              />
            )}
            <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-white/50" />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() =>
                setFacingMode((current) =>
                  current === "environment" ? "user" : "environment"
                )
              }
            >
              <RotateCcw className="size-4" />
              Switch camera
            </Button>
            <Button
              type="button"
              className="flex-1 gap-2"
              onClick={handleCapture}
              disabled={Boolean(error)}
            >
              <Camera className="size-4" />
              Capture photo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
