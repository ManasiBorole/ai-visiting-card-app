import { suggestCategory } from "@/lib/ai/category-suggestion";
import { detectBusinessType } from "@/lib/ai/business-type";
import { generateContactSummary } from "@/lib/ai/contact-summary";
import { detectDuplicateContacts } from "@/lib/ai/duplicate-detection";
import { suggestOcrCorrections } from "@/lib/ai/ocr-corrections";
import { parseSmartSearchQuery } from "@/lib/ai/smart-search";
import type {
  ContactAnalysisResult,
  ContactFields,
  ContactSummaryResult,
  SmartSearchParseResult,
} from "@/lib/ai/types";
import { prisma } from "@/database/client";
import {
  advancedSearchVisitingCards,
  getSearchTerms,
} from "@/services/search.service";
import type { SearchQueryInput } from "@/lib/validations/search";

function cardTags(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === "string");
  }
  return [];
}

async function getExistingContacts(userId: string) {
  return prisma.visitingCard.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      company: true,
      mobile: true,
      alternateMobile: true,
      email: true,
    },
  });
}

export async function analyzeContactFields(
  userId: string,
  contact: ContactFields,
  excludeId?: string
): Promise<ContactAnalysisResult> {
  const [existingContacts, categories] = await Promise.all([
    getExistingContacts(userId),
    prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
  ]);

  const duplicates = detectDuplicateContacts(contact, existingContacts, excludeId);
  const categorySuggestion = suggestCategory(contact, categories);
  const businessType = detectBusinessType(contact);
  const ocrCorrections = suggestOcrCorrections(contact);
  const summary = generateContactSummary(contact).summary;

  return {
    duplicates,
    categorySuggestion,
    businessType,
    summary,
    ocrCorrections,
  };
}

export async function getContactSummaryById(
  userId: string,
  contactId: string
): Promise<ContactSummaryResult | null> {
  const contact = await prisma.visitingCard.findFirst({
    where: { id: contactId, userId },
    include: {
      category: {
        select: { name: true },
      },
    },
  });

  if (!contact) return null;

  return generateContactSummary({
    name: contact.name,
    company: contact.company ?? undefined,
    designation: contact.designation ?? undefined,
    mobile: contact.mobile ?? undefined,
    alternateMobile: contact.alternateMobile ?? undefined,
    email: contact.email ?? undefined,
    website: contact.website ?? undefined,
    address: contact.address ?? undefined,
    city: contact.city ?? undefined,
    state: contact.state ?? undefined,
    country: contact.country ?? undefined,
    gstNumber: contact.gstNumber ?? undefined,
    notes: contact.notes ?? undefined,
    categoryName: contact.category?.name,
    tags: cardTags(contact.tags),
    createdAt: contact.createdAt,
  });
}

export async function runSmartSearch(
  userId: string,
  query: string
): Promise<{
  parsed: SmartSearchParseResult;
  results: Awaited<ReturnType<typeof advancedSearchVisitingCards>>;
  highlightTerms: string[];
}> {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  });

  const parsed = parseSmartSearchQuery(query, categories);

  const searchInput: SearchQueryInput = {
    q: parsed.filters.q,
    name: parsed.filters.name,
    company: parsed.filters.company,
    phone: parsed.filters.phone,
    email: parsed.filters.email,
    city: parsed.filters.city,
    state: parsed.filters.state,
    gst: parsed.filters.gst,
    tag: parsed.filters.tag,
    categoryId: parsed.filters.categoryId,
    sort: "updatedDesc",
  };

  const results = await advancedSearchVisitingCards(userId, searchInput);
  const highlightTerms = [
    ...getSearchTerms(searchInput),
    ...parsed.keywords,
  ].filter(Boolean);

  return {
    parsed,
    results,
    highlightTerms: [...new Set(highlightTerms)],
  };
}

export async function scanAllDuplicates(userId: string) {
  const contacts = await prisma.visitingCard.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      company: true,
      mobile: true,
      alternateMobile: true,
      email: true,
    },
  });

  const duplicateGroups: Array<{
    primaryId: string;
    primaryName: string;
    matches: ReturnType<typeof detectDuplicateContacts>;
  }> = [];

  const seen = new Set<string>();

  for (const contact of contacts) {
    if (seen.has(contact.id)) continue;

    const matches = detectDuplicateContacts(
      {
        name: contact.name,
        company: contact.company ?? undefined,
        mobile: contact.mobile ?? undefined,
        alternateMobile: contact.alternateMobile ?? undefined,
        email: contact.email ?? undefined,
      },
      contacts,
      contact.id
    );

    if (matches.length === 0) continue;

    matches.forEach((match) => seen.add(match.id));
    seen.add(contact.id);

    duplicateGroups.push({
      primaryId: contact.id,
      primaryName: contact.name,
      matches,
    });
  }

  return duplicateGroups;
}
