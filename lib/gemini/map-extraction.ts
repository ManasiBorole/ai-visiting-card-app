import type { ExtractedCardFields } from "@/types/extraction";
import type { GeminiBusinessCardResult } from "@/lib/gemini/parse-response";

function buildNotesFromExtras(data: GeminiBusinessCardResult) {
  const parts: string[] = [];

  if (data.tagline.trim()) {
    parts.push(`Tagline: ${data.tagline.trim()}`);
  }

  if (data.services.length > 0) {
    parts.push(`Services: ${data.services.join(", ")}`);
  }

  if (data.socialMedia.length > 0) {
    parts.push(`Social media: ${data.socialMedia.join(", ")}`);
  }

  if (data.extraDetails.trim()) {
    parts.push(data.extraDetails.trim());
  }

  return parts.join("\n");
}

export function mapGeminiToExtractedFields(
  data: GeminiBusinessCardResult
): ExtractedCardFields {
  return {
    name: data.name.trim(),
    company: data.company.trim(),
    designation: data.designation.trim(),
    mobile: data.mobile.trim(),
    alternateMobile: data.alternateMobile.trim(),
    email: data.email.trim(),
    website: data.website.trim(),
    address: data.address.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    country: data.country.trim(),
    pinCode: data.pinCode.trim(),
    gstNumber: data.gstNumber.trim(),
    notes: buildNotesFromExtras(data),
  };
}

export function mergeGeminiExtractions(
  primary: GeminiBusinessCardResult,
  secondary: GeminiBusinessCardResult
): GeminiBusinessCardResult {
  return {
    name: primary.name || secondary.name,
    company: primary.company || secondary.company,
    designation: primary.designation || secondary.designation,
    mobile: primary.mobile || secondary.mobile,
    alternateMobile: primary.alternateMobile || secondary.alternateMobile,
    email: primary.email || secondary.email,
    website: primary.website || secondary.website,
    address: primary.address || secondary.address,
    city: primary.city || secondary.city,
    state: primary.state || secondary.state,
    country: primary.country || secondary.country,
    pinCode: primary.pinCode || secondary.pinCode,
    gstNumber: primary.gstNumber || secondary.gstNumber,
    tagline: primary.tagline || secondary.tagline,
    services: primary.services.length > 0 ? primary.services : secondary.services,
    socialMedia:
      primary.socialMedia.length > 0 ? primary.socialMedia : secondary.socialMedia,
    extraDetails: primary.extraDetails || secondary.extraDetails,
  };
}
