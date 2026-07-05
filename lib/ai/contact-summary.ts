import type { ContactFields, ContactSummaryResult } from "@/lib/ai/types";
import { detectBusinessType } from "@/lib/ai/business-type";

type SummaryContact = ContactFields & {
  categoryName?: string | null;
  tags?: string[];
  country?: string | null;
  createdAt?: Date | string;
};

function formatLocation(contact: SummaryContact) {
  return [contact.city, contact.state, contact.country]
    .filter(Boolean)
    .join(", ");
}

export function generateContactSummary(
  contact: SummaryContact
): ContactSummaryResult {
  const highlights: string[] = [];
  const parts: string[] = [];

  if (contact.name) {
    let intro = contact.name;

    if (contact.designation && contact.company) {
      intro += ` is ${contact.designation} at ${contact.company}`;
      highlights.push(`${contact.designation} · ${contact.company}`);
    } else if (contact.company) {
      intro += ` is associated with ${contact.company}`;
      highlights.push(contact.company);
    } else if (contact.designation) {
      intro += ` works as ${contact.designation}`;
      highlights.push(contact.designation);
    }

    parts.push(`${intro}.`);
  }

  const location = formatLocation(contact);
  if (location) {
    parts.push(`Based in ${location}.`);
    highlights.push(location);
  }

  if (contact.mobile) {
    parts.push(`Primary phone: ${contact.mobile}.`);
    highlights.push(contact.mobile);
  }

  if (contact.email) {
    parts.push(`Reachable via ${contact.email}.`);
    highlights.push(contact.email);
  }

  if (contact.website) {
    parts.push(`Website: ${contact.website}.`);
  }

  if (contact.gstNumber) {
    parts.push(`GST registered (${contact.gstNumber}).`);
    highlights.push("GST registered");
  }

  if (contact.categoryName) {
    parts.push(`Categorized as ${contact.categoryName}.`);
    highlights.push(contact.categoryName);
  }

  if (contact.tags && contact.tags.length > 0) {
    parts.push(`Tags: ${contact.tags.join(", ")}.`);
  }

  if (contact.notes?.trim()) {
    parts.push(`Notes: ${contact.notes.trim()}`);
  }

  const businessType = detectBusinessType(contact);

  if (businessType) {
    parts.push(
      `Likely business type: ${businessType.type} (${businessType.signals.join(", ")}).`
    );
  }

  return {
    summary: parts.join(" ") || "Not enough information to generate a summary yet.",
    highlights: highlights.slice(0, 5),
    businessType,
  };
}
