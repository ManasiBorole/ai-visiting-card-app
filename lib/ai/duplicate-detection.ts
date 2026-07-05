import type { AiConfidence, ContactFields, DuplicateMatch } from "@/lib/ai/types";

type ExistingContact = {
  id: string;
  name: string;
  company: string | null;
  mobile: string | null;
  alternateMobile: string | null;
  email: string | null;
};

function normalizePhone(value?: string | null) {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

function normalizeEmail(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

export function detectDuplicateContacts(
  incoming: ContactFields,
  existingContacts: ExistingContact[],
  excludeId?: string
): DuplicateMatch[] {
  if (!incoming.name?.trim()) return [];

  const matches: DuplicateMatch[] = [];

  for (const existing of existingContacts) {
    if (excludeId && existing.id === excludeId) continue;

    const incomingEmail = normalizeEmail(incoming.email);
    const existingEmail = normalizeEmail(existing.email);

    if (incomingEmail && existingEmail && incomingEmail === existingEmail) {
      matches.push({
        id: existing.id,
        name: existing.name,
        company: existing.company,
        email: existing.email,
        mobile: existing.mobile,
        reason: "email",
        confidence: "high",
      });
      continue;
    }

    const incomingPhone = normalizePhone(incoming.mobile);
    const incomingAltPhone = normalizePhone(incoming.alternateMobile);

    const existingPhones = [
      normalizePhone(existing.mobile),
      normalizePhone(existing.alternateMobile),
    ].filter(Boolean);

    if (
      (incomingPhone && existingPhones.includes(incomingPhone)) ||
      (incomingAltPhone && existingPhones.includes(incomingAltPhone))
    ) {
      matches.push({
        id: existing.id,
        name: existing.name,
        company: existing.company,
        email: existing.email,
        mobile: existing.mobile,
        reason: "phone",
        confidence: "high",
      });
      continue;
    }

    if (
      normalizeText(incoming.name) === normalizeText(existing.name) &&
      normalizeText(incoming.company) === normalizeText(existing.company)
    ) {
      matches.push({
        id: existing.id,
        name: existing.name,
        company: existing.company,
        email: existing.email,
        mobile: existing.mobile,
        reason: "name-company",
        confidence: "medium",
      });
    }
  }

  return matches;
}

export function duplicateReasonLabel(reason: DuplicateMatch["reason"]) {
  switch (reason) {
    case "email":
      return "Same email address";
    case "phone":
      return "Same phone number";
    case "name-company":
      return "Same name and company";
    default:
      return "Possible duplicate";
  }
}

export function confidenceLabel(confidence: AiConfidence) {
  return confidence.charAt(0).toUpperCase() + confidence.slice(1);
}
