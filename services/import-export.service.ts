import * as XLSX from "xlsx";

import type {
  ExportContactRecord,
  ImportResult,
  ParsedImportRow,
} from "@/lib/import-export/constants";
import {
  checkDuplicateInBatch,
  checkDuplicateInExisting,
} from "@/lib/import-export/duplicates";
import {
  contactsToSheetData,
  mapRawRowToContact,
} from "@/lib/import-export/mappers";
import { prisma } from "@/database/client";
import { createVisitingCardSchema } from "@/lib/validations/visiting-card";

export async function getExportContacts(userId: string) {
  return prisma.visitingCard.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      name: true,
      company: true,
      designation: true,
      mobile: true,
      alternateMobile: true,
      email: true,
      website: true,
      address: true,
      city: true,
      state: true,
      country: true,
      pinCode: true,
      gstNumber: true,
      notes: true,
      tags: true,
      category: {
        select: { name: true },
      },
    },
  });
}

export function buildCsvBuffer(contacts: ExportContactRecord[]) {
  const sheetData = contactsToSheetData(contacts);
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return Buffer.from(csv, "utf-8");
}

export function buildExcelBuffer(contacts: ExportContactRecord[]) {
  const sheetData = contactsToSheetData(contacts);
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function buildImportTemplateBuffer() {
  const sheetData = contactsToSheetData([]);
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

function parseTags(value?: string) {
  if (!value?.trim()) return undefined;

  const tags = value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return tags.length > 0 ? tags : undefined;
}

function parseWorkbookRows(buffer: Buffer): ParsedImportRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return [];
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return rawRows
    .map((row, index) => mapRawRowToContact(row, index + 2))
    .filter((row) =>
      Object.values(row).some(
        (value) => typeof value === "string" && value.trim().length > 0
      )
    );
}

export async function importContactsFromFile(
  userId: string,
  buffer: Buffer,
  filename: string
): Promise<ImportResult> {
  const lowerName = filename.toLowerCase();
  const isSupported =
    lowerName.endsWith(".xlsx") ||
    lowerName.endsWith(".xls") ||
    lowerName.endsWith(".csv");

  if (!isSupported) {
    throw new Error("Please upload a CSV or Excel (.xlsx) file");
  }

  const parsedRows = parseWorkbookRows(buffer);

  if (parsedRows.length === 0) {
    throw new Error("No contact rows found in the uploaded file");
  }

  const [existingContacts, categories] = await Promise.all([
    prisma.visitingCard.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        company: true,
        mobile: true,
        alternateMobile: true,
        email: true,
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
    }),
  ]);

  const categoryMap = new Map(
    categories.map((category) => [category.name.toLowerCase(), category.id])
  );

  const result: ImportResult = {
    totalRows: parsedRows.length,
    imported: 0,
    duplicates: [],
    invalid: [],
  };

  const acceptedInBatch: ParsedImportRow[] = [];

  for (const row of parsedRows) {
    if (!row.name?.trim()) {
      result.invalid.push({
        rowNumber: row.rowNumber,
        error: "Name is required",
      });
      continue;
    }

    const duplicateInExisting = checkDuplicateInExisting(row, existingContacts);
    if (duplicateInExisting) {
      result.duplicates.push({ ...duplicateInExisting, rowNumber: row.rowNumber });
      continue;
    }

    const duplicateInBatch = checkDuplicateInBatch(row, acceptedInBatch);
    if (duplicateInBatch) {
      result.duplicates.push({ ...duplicateInBatch, rowNumber: row.rowNumber });
      continue;
    }

    const categoryId = row.categoryName
      ? categoryMap.get(row.categoryName.trim().toLowerCase())
      : undefined;

    const parsed = createVisitingCardSchema.safeParse({
      name: row.name,
      company: row.company,
      designation: row.designation,
      mobile: row.mobile,
      alternateMobile: row.alternateMobile,
      email: row.email,
      website: row.website,
      address: row.address,
      city: row.city,
      state: row.state,
      pinCode: row.pinCode,
      gstNumber: row.gstNumber,
      notes: row.notes,
      categoryId,
    });

    if (!parsed.success) {
      result.invalid.push({
        rowNumber: row.rowNumber,
        error: parsed.error.issues[0]?.message ?? "Invalid row data",
      });
      continue;
    }

    const tags = parseTags(row.tags);

    await prisma.visitingCard.create({
      data: {
        ...parsed.data,
        country: row.country,
        tags,
        userId,
      },
    });

    acceptedInBatch.push(row);
    existingContacts.push({
      id: `import-${row.rowNumber}`,
      name: parsed.data.name,
      company: parsed.data.company ?? null,
      mobile: parsed.data.mobile ?? null,
      alternateMobile: parsed.data.alternateMobile ?? null,
      email: parsed.data.email ?? null,
    });

    result.imported += 1;
  }

  if (result.imported > 0) {
    await prisma.activityLog.create({
      data: {
        action: `Imported ${result.imported} contact${result.imported === 1 ? "" : "s"} from ${filename}`,
        userId,
      },
    });
  }

  return result;
}
