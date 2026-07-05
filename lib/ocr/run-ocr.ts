import type { OcrScanProgress } from "@/types/ocr";

export async function runOcrOnImage(
  image: Blob | string,
  onProgress?: (progress: OcrScanProgress) => void
): Promise<string> {
  const { createWorker } = await import("tesseract.js");

  const worker = await createWorker("eng", undefined, {
    logger: (message) => {
      if (!onProgress) return;

      if (message.status === "recognizing text") {
        onProgress({
          status: "Reading text from card...",
          progress: Math.round((message.progress ?? 0) * 100),
        });
        return;
      }

      onProgress({
        status: formatOcrStatus(message.status),
        progress: Math.round((message.progress ?? 0) * 100),
      });
    },
  });

  try {
    onProgress?.({
      status: "Initializing OCR engine...",
      progress: 5,
    });

    const {
      data: { text },
    } = await worker.recognize(image);

    onProgress?.({
      status: "Extracting contact fields...",
      progress: 100,
    });

    return text;
  } finally {
    await worker.terminate();
  }
}

function formatOcrStatus(status: string) {
  switch (status) {
    case "loading tesseract core":
      return "Loading OCR engine...";
    case "initializing tesseract":
      return "Initializing scanner...";
    case "loading language traineddata":
      return "Loading language model...";
    case "initializing api":
      return "Preparing image analysis...";
    case "recognizing text":
      return "Reading text from card...";
    default:
      return "Scanning visiting card...";
  }
}
