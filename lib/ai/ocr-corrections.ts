import type { ContactFields, OcrCorrection } from "@/lib/ai/types";

const EMAIL_FIXES: Array<[RegExp, string, string]> = [
  [/gmial\.com/gi, "gmail.com", "Common OCR misread of gmail.com"],
  [/gmai1\.com/gi, "gmail.com", "Common OCR misread of gmail.com"],
  [/yah00\.com/gi, "yahoo.com", "Common OCR misread of yahoo.com"],
  [/\.c0m/gi, ".com", "Zero misread as letter O in domain"],
  [/\.corn/gi, ".com", "rn misread as m in domain"],
  [/\s+@/g, "@", "Remove space before @ symbol"],
  [/(@[^\s]+)\s+\./g, "$1.", "Remove space before domain suffix"],
];

const WEBSITE_FIXES: Array<[RegExp, string, string]> = [
  [/^www\./i, "https://www.", "Add secure protocol to website"],
  [/^(?!https?:\/\/)([a-z0-9.-]+\.[a-z]{2,})/i, "https://$1", "Add https protocol"],
];

function titleCaseName(value: string) {
  if (value !== value.toUpperCase()) return value;

  return value
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizePhone(value: string) {
  const cleaned = value
    .replace(/[oO]/g, "0")
    .replace(/[Il|]/g, "1")
    .replace(/[^\d+\-\s()]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned;
}

function normalizeGst(value: string) {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

function pushCorrection(
  corrections: OcrCorrection[],
  field: keyof ContactFields,
  current: string,
  suggested: string,
  reason: string,
  confidence: OcrCorrection["confidence"] = "medium"
) {
  if (!current.trim() || current.trim() === suggested.trim()) return;

  corrections.push({
    field,
    current,
    suggested,
    reason,
    confidence,
  });
}

export function suggestOcrCorrections(contact: ContactFields): OcrCorrection[] {
  const corrections: OcrCorrection[] = [];

  if (contact.name) {
    const suggested = titleCaseName(contact.name);
    pushCorrection(
      corrections,
      "name",
      contact.name,
      suggested,
      "Normalize all-caps OCR name to title case",
      "low"
    );
  }

  if (contact.email) {
    let suggested = contact.email.trim();
    let reason = "Fix common OCR email mistakes";

    for (const [pattern, replacement, fixReason] of EMAIL_FIXES) {
      if (pattern.test(suggested)) {
        suggested = suggested.replace(pattern, replacement);
        reason = fixReason;
      }
    }

    pushCorrection(corrections, "email", contact.email, suggested, reason, "high");
  }

  if (contact.mobile) {
    const suggested = normalizePhone(contact.mobile);
    pushCorrection(
      corrections,
      "mobile",
      contact.mobile,
      suggested,
      "Normalize phone characters misread by OCR",
      "medium"
    );
  }

  if (contact.website) {
    let suggested = contact.website.trim();
    let reason = "Normalize website URL";

    for (const [pattern, replacement, fixReason] of WEBSITE_FIXES) {
      if (pattern.test(suggested)) {
        suggested = suggested.replace(pattern, replacement);
        reason = fixReason;
      }
    }

    pushCorrection(corrections, "website", contact.website, suggested, reason, "medium");
  }

  if (contact.gstNumber) {
    const suggested = normalizeGst(contact.gstNumber);
    pushCorrection(
      corrections,
      "gstNumber",
      contact.gstNumber,
      suggested,
      "Normalize GST format to uppercase alphanumeric",
      "high"
    );
  }

  if (contact.company) {
    const suggested = titleCaseName(contact.company);
    pushCorrection(
      corrections,
      "company",
      contact.company,
      suggested,
      "Normalize all-caps OCR company name",
      "low"
    );
  }

  return corrections;
}
