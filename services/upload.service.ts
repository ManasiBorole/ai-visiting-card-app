import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import {
  detectImageMimeType,
  validateImageBuffer,
} from "@/lib/security/file-validation";

export type CardImageSide = "front" | "back";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
const STORAGE_ROOT = path.join(process.cwd(), "storage", "uploads", "cards");
const LEGACY_PUBLIC_ROOT = path.join(process.cwd(), "public", "uploads", "cards");

export function buildUploadApiUrl(userId: string, filename: string) {
  return `/api/uploads/cards/${userId}/${filename}`;
}

export function resolveCardImageUrl(url: string | null | undefined) {
  if (!url) return null;

  if (url.startsWith("/api/uploads/cards/")) {
    return url;
  }

  const legacyMatch = url.match(/^\/uploads\/cards\/([^/]+)\/(.+)$/);

  if (legacyMatch) {
    const [, userId, filename] = legacyMatch;
    return buildUploadApiUrl(userId, filename);
  }

  return url;
}

export async function readStoredCardImage(userId: string, filename: string) {
  const safeName = path.basename(filename);
  const privatePath = path.join(STORAGE_ROOT, userId, safeName);
  const legacyPath = path.join(LEGACY_PUBLIC_ROOT, userId, safeName);

  try {
    const buffer = await readFile(privatePath);
    const mimeType = detectImageMimeType(buffer) ?? "image/jpeg";
    return { buffer, mimeType };
  } catch {
    const buffer = await readFile(legacyPath);
    const mimeType = detectImageMimeType(buffer) ?? "image/jpeg";
    return { buffer, mimeType };
  }
}

export async function saveCardImage(
  userId: string,
  buffer: Buffer,
  side: CardImageSide
) {
  const validationError = validateImageBuffer(buffer, MAX_FILE_SIZE);

  if (validationError) {
    throw new Error(validationError);
  }

  const detectedMime = detectImageMimeType(buffer);

  if (!detectedMime) {
    throw new Error("Invalid image file. Use JPG, PNG, or WebP.");
  }

  const extension =
    detectedMime === "image/png"
      ? "png"
      : detectedMime === "image/webp"
        ? "webp"
        : "jpg";

  const filename = `${Date.now()}-${randomUUID()}-${side}.${extension}`;
  const absoluteDir = path.join(STORAGE_ROOT, userId);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(path.join(absoluteDir, filename), buffer);

  return {
    url: buildUploadApiUrl(userId, filename),
    filename,
    size: buffer.byteLength,
    side,
    mimeType: detectedMime,
  };
}
