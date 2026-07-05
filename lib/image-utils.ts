import type { Area } from "react-easy-crop";

export const CARD_ASPECT_RATIO = 1.586;
export const MAX_UPLOAD_SIZE_MB = 5;
export const TARGET_COMPRESSED_SIZE_MB = 1;

const TO_RADIANS = Math.PI / 180;

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = rotation * TO_RADIANS;
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  mimeType: "image/jpeg" | "image/webp" = "image/jpeg",
  quality = 0.92
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  const rotRad = rotation * TO_RADIANS;
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    throw new Error("Could not get cropped canvas context");
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to crop image"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export async function compressImageBlob(
  blob: Blob,
  maxSizeMB = TARGET_COMPRESSED_SIZE_MB
): Promise<Blob> {
  const imageCompression = (await import("browser-image-compression")).default;

  const file = new File([blob], "card-image.jpg", {
    type: blob.type || "image/jpeg",
  });

  return imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.85,
    fileType: "image/jpeg",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateImageFile(file: File): string | null {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (!allowed.includes(file.type)) {
    return "Please upload a JPG, PNG, or WebP image";
  }

  if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    return `Image must be smaller than ${MAX_UPLOAD_SIZE_MB}MB`;
  }

  return null;
}
