import { readFile } from "fs/promises";
import path from "path";

import { randomUUID } from "crypto";

import { configureCloudinary } from "@/lib/cloudinary";
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

function getCloudinaryFolder(userId: string, side: CardImageSide) {
  return `cardvault/users/${userId}/${side}`;
}

function assertSafePathSegment(value: string, label: string) {
  if (
    !value ||
    value.includes("..") ||
    value.includes("/") ||
    value.includes("\\")
  ) {
    throw new Error(`Invalid ${label}`);
  }
}

export async function readStoredCardImage(userId: string, filename: string) {
  assertSafePathSegment(userId, "userId");

  const safeName = path.basename(filename);

  if (!safeName || safeName !== filename) {
    throw new Error("Invalid filename");
  }
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

  const cloudinary = configureCloudinary();
  const publicId = `${Date.now()}-${randomUUID()}`;

  const result = await cloudinary.uploader.upload(
    `data:${detectedMime};base64,${buffer.toString("base64")}`,
    {
      folder: getCloudinaryFolder(userId, side),
      public_id: publicId,
      resource_type: "image",
      overwrite: false,
    }
  );

  if (!result.secure_url) {
    throw new Error("Cloudinary upload did not return a secure URL.");
  }

  return {
    url: result.secure_url,
    filename: result.public_id,
    size: buffer.byteLength,
    side,
    mimeType: detectedMime,
  };
}
