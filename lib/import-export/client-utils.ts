import type { DuplicateMatchReason } from "@/lib/import-export/constants";

export function duplicateReasonLabel(reason: DuplicateMatchReason) {
  switch (reason) {
    case "email":
      return "Matching email";
    case "phone":
      return "Matching phone";
    case "name-company":
      return "Matching name and company";
    case "import-batch":
      return "Duplicate within import file";
    default:
      return "Duplicate";
  }
}

export function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
