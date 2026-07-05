import type { ExtractedCardFields } from "@/types/ocr";

const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX =
  /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4,6}/g;
const WEBSITE_REGEX =
  /(?:https?:\/\/|www\.)[^\s,;]+/gi;
const GST_REGEX =
  /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/g;

const DESIGNATION_KEYWORDS = [
  "chief",
  "ceo",
  "cto",
  "cfo",
  "coo",
  "director",
  "manager",
  "president",
  "founder",
  "partner",
  "head",
  "lead",
  "engineer",
  "consultant",
  "proprietor",
  "owner",
  "vp",
  "vice president",
  "executive",
  "officer",
  "architect",
  "designer",
  "analyst",
];

const COMPANY_SUFFIXES = [
  "pvt",
  "ltd",
  "limited",
  "llc",
  "inc",
  "corp",
  "corporation",
  "company",
  "co.",
  "llp",
  "gmbh",
  "solutions",
  "technologies",
  "tech",
  "agency",
  "group",
  "enterprises",
];

function cleanLine(line: string) {
  return line
    .replace(/\|/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function uniqueValues(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function extractEmails(text: string) {
  return uniqueValues(text.match(EMAIL_REGEX) ?? []);
}

function extractPhones(text: string) {
  const matches = text.match(PHONE_REGEX) ?? [];
  return uniqueValues(
    matches
      .map((phone) => phone.replace(/\s{2,}/g, " ").trim())
      .filter((phone) => phone.replace(/\D/g, "").length >= 7)
  );
}

function extractWebsites(text: string) {
  return uniqueValues(
    (text.match(WEBSITE_REGEX) ?? []).map((site) =>
      site.replace(/[.,;]+$/, "").trim()
    )
  );
}

function extractGst(text: string) {
  const upper = text.toUpperCase();
  return uniqueValues(upper.match(GST_REGEX) ?? []);
}

function isLikelyDesignation(line: string) {
  const lower = line.toLowerCase();
  return DESIGNATION_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function isLikelyCompany(line: string) {
  const lower = line.toLowerCase();
  return COMPANY_SUFFIXES.some((suffix) => lower.includes(suffix));
}

function isContactLine(line: string) {
  return (
    EMAIL_REGEX.test(line) ||
    PHONE_REGEX.test(line) ||
    WEBSITE_REGEX.test(line) ||
    GST_REGEX.test(line)
  );
}

function pickName(lines: string[], usedLines: Set<string>) {
  for (const line of lines.slice(0, 6)) {
    if (usedLines.has(line)) continue;
    if (line.length < 3 || line.length > 60) continue;
    if (isContactLine(line)) continue;
    if (isLikelyDesignation(line) && !line.includes(" ")) continue;
    if (/^\d/.test(line)) continue;

    usedLines.add(line);
    return line;
  }

  return "";
}

function pickCompany(lines: string[], usedLines: Set<string>) {
  const companyCandidate = lines.find(
    (line) => !usedLines.has(line) && isLikelyCompany(line)
  );

  if (companyCandidate) {
    usedLines.add(companyCandidate);
    return companyCandidate;
  }

  for (const line of lines.slice(0, 8)) {
    if (usedLines.has(line)) continue;
    if (isContactLine(line)) continue;
    if (isLikelyDesignation(line)) continue;
    if (line.length < 4) continue;

    usedLines.add(line);
    return line;
  }

  return "";
}

function pickDesignation(lines: string[], usedLines: Set<string>) {
  const designation = lines.find(
    (line) => !usedLines.has(line) && isLikelyDesignation(line)
  );

  if (designation) {
    usedLines.add(designation);
    return designation;
  }

  return "";
}

function pickAddress(lines: string[], usedLines: Set<string>) {
  const addressLines = lines.filter((line) => {
    if (usedLines.has(line)) return false;
    if (isContactLine(line)) return false;
    if (isLikelyDesignation(line)) return false;
    if (isLikelyCompany(line)) return false;

    return (
      /\d/.test(line) ||
      /\b(road|street|lane|avenue|sector|block|floor|suite|nagar|colony|park)\b/i.test(
        line
      ) ||
      line.length > 20
    );
  });

  const address = addressLines.slice(0, 3).join(", ");
  addressLines.slice(0, 3).forEach((line) => usedLines.add(line));

  return address;
}

export function parseCardText(rawText: string): ExtractedCardFields {
  const lines = rawText
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean);

  const usedLines = new Set<string>();
  const emails = extractEmails(rawText);
  const phones = extractPhones(rawText);
  const websites = extractWebsites(rawText);
  const gstNumbers = extractGst(rawText);

  const name = pickName(lines, usedLines);
  const company = pickCompany(lines, usedLines);
  const designation = pickDesignation(lines, usedLines);
  const address = pickAddress(lines, usedLines);

  return {
    name,
    company,
    designation,
    mobile: phones[0] ?? "",
    email: emails[0] ?? "",
    website: websites[0] ?? "",
    address,
    gstNumber: gstNumbers[0] ?? "",
  };
}

export function mergeExtractedFields(
  primary: ExtractedCardFields,
  secondary: ExtractedCardFields
): ExtractedCardFields {
  return {
    name: primary.name || secondary.name,
    company: primary.company || secondary.company,
    designation: primary.designation || secondary.designation,
    mobile: primary.mobile || secondary.mobile,
    email: primary.email || secondary.email,
    website: primary.website || secondary.website,
    address: primary.address || secondary.address,
    gstNumber: primary.gstNumber || secondary.gstNumber,
  };
}
