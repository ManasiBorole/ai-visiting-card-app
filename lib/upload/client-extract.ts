import type { PreparedImage } from "@/components/upload/image-slot-uploader";
import type { ExtractedCardFields } from "@/types/extraction";

export async function uploadCardImage(
  image: PreparedImage,
  side: "front" | "back" = "front"
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

export async function extractWithGemini(
  frontImage: PreparedImage,
  backImage: PreparedImage | null = null
): Promise<ExtractedCardFields> {
  const formData = new FormData();
  formData.append(
    "front",
    new File([frontImage.blob], "front-card.jpg", { type: "image/jpeg" })
  );

  if (backImage) {
    formData.append(
      "back",
      new File([backImage.blob], "back-card.jpg", { type: "image/jpeg" })
    );
  }

  const response = await fetch("/api/gemini/extract", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? "AI extraction failed. Please try again.");
  }

  return result.data as ExtractedCardFields;
}
