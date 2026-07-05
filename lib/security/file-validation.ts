const IMAGE_SIGNATURES: Array<{ mime: string; bytes: number[] }> = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

export function detectImageMimeType(buffer: Buffer): string | null {
  for (const signature of IMAGE_SIGNATURES) {
    if (signature.bytes.every((byte, index) => buffer[index] === byte)) {
      if (signature.mime === "image/webp") {
        const webpHeader = buffer.subarray(8, 12).toString("ascii");
        return webpHeader === "WEBP" ? "image/webp" : null;
      }

      return signature.mime;
    }
  }

  return null;
}

export function validateImageBuffer(buffer: Buffer, maxBytes: number) {
  if (buffer.byteLength === 0) {
    return "Empty file uploaded";
  }

  if (buffer.byteLength > maxBytes) {
    return `File is too large (max ${Math.round(maxBytes / (1024 * 1024))}MB)`;
  }

  const detectedMime = detectImageMimeType(buffer);

  if (!detectedMime) {
    return "Invalid image file. Use JPG, PNG, or WebP.";
  }

  return null;
}
