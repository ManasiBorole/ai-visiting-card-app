import type { ExportContactRecord, ImportContactRow } from "@/lib/import-export/constants";
import { EXPORT_HEADERS, HEADER_TO_FIELD } from "@/lib/import-export/constants";

function cardTags(tags: unknown): string {
  if (!tags) return "";
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === "string").join(", ");
  }
  return "";
}

export function contactToExportRow(contact: ExportContactRecord): string[] {
  return [
    contact.name,
    contact.company ?? "",
    contact.designation ?? "",
    contact.mobile ?? "",
    contact.alternateMobile ?? "",
    contact.email ?? "",
    contact.website ?? "",
    contact.address ?? "",
    contact.city ?? "",
    contact.state ?? "",
    contact.country ?? "",
    contact.pinCode ?? "",
    contact.gstNumber ?? "",
    contact.category?.name ?? "",
    cardTags(contact.tags),
    contact.notes ?? "",
  ];
}

export function contactsToSheetData(contacts: ExportContactRecord[]): string[][] {
  return [[...EXPORT_HEADERS], ...contacts.map(contactToExportRow)];
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function cellValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function mapRawRowToContact(
  row: Record<string, unknown>,
  rowNumber: number
): ImportContactRow & { rowNumber: number } {
  const mapped: ImportContactRow = { name: "" };

  for (const [header, value] of Object.entries(row)) {
    const field = HEADER_TO_FIELD[normalizeHeader(header)];
    if (!field) continue;

    const text = cellValue(value);
    if (!text) continue;

    if (field === "name") mapped.name = text;
    else mapped[field] = text;
  }

  return { ...mapped, rowNumber };
}

export function buildExportFilename(format: "csv" | "xlsx", date = new Date()) {
  const stamp = date.toISOString().slice(0, 10);
  return `visiting-cards-${stamp}.${format === "csv" ? "csv" : "xlsx"}`;
}
