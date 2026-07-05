import type { Prisma } from "@/database/generated/client";
import { prisma } from "@/database/client";
import {
  searchQuerySchema,
  type SearchQueryInput,
  type SearchSortValue,
} from "@/lib/validations/search";

function buildOrderBy(
  sort: SearchSortValue
): Prisma.VisitingCardOrderByWithRelationInput {
  switch (sort) {
    case "updatedAsc":
      return { updatedAt: "asc" };
    case "nameAsc":
      return { name: "asc" };
    case "nameDesc":
      return { name: "desc" };
    case "companyAsc":
      return { company: "asc" };
    case "createdDesc":
      return { createdAt: "desc" };
    case "updatedDesc":
    default:
      return { updatedAt: "desc" };
  }
}

function cardTags(card: { tags: unknown }): string[] {
  if (!card.tags) return [];
  if (Array.isArray(card.tags)) {
    return card.tags.filter((tag): tag is string => typeof tag === "string");
  }
  return [];
}

function matchesTag(card: { tags: unknown }, tag: string) {
  const needle = tag.toLowerCase();
  return cardTags(card).some((value) => value.toLowerCase().includes(needle));
}

export async function advancedSearchVisitingCards(
  userId: string,
  input: SearchQueryInput
) {
  const params = searchQuerySchema.parse(input);
  const andConditions: Prisma.VisitingCardWhereInput[] = [{ userId }];

  if (params.name?.trim()) {
    andConditions.push({ name: { contains: params.name.trim() } });
  }

  if (params.company?.trim()) {
    andConditions.push({ company: { contains: params.company.trim() } });
  }

  if (params.phone?.trim()) {
    const phone = params.phone.trim();
    andConditions.push({
      OR: [{ mobile: { contains: phone } }, { alternateMobile: { contains: phone } }],
    });
  }

  if (params.email?.trim()) {
    andConditions.push({ email: { contains: params.email.trim() } });
  }

  if (params.city?.trim()) {
    andConditions.push({ city: { contains: params.city.trim() } });
  }

  if (params.state?.trim()) {
    andConditions.push({ state: { contains: params.state.trim() } });
  }

  if (params.gst?.trim()) {
    andConditions.push({ gstNumber: { contains: params.gst.trim() } });
  }

  if (params.categoryId?.trim()) {
    andConditions.push({ categoryId: params.categoryId.trim() });
  }

  const generalQuery = params.q?.trim();

  if (generalQuery) {
    andConditions.push({
      OR: [
        { name: { contains: generalQuery } },
        { company: { contains: generalQuery } },
        { email: { contains: generalQuery } },
        { mobile: { contains: generalQuery } },
        { alternateMobile: { contains: generalQuery } },
        { city: { contains: generalQuery } },
        { state: { contains: generalQuery } },
        { gstNumber: { contains: generalQuery } },
        { designation: { contains: generalQuery } },
        { notes: { contains: generalQuery } },
        { category: { name: { contains: generalQuery } } },
      ],
    });
  }

  const hasFilters =
    Boolean(generalQuery) ||
    Boolean(params.name?.trim()) ||
    Boolean(params.company?.trim()) ||
    Boolean(params.phone?.trim()) ||
    Boolean(params.email?.trim()) ||
    Boolean(params.city?.trim()) ||
    Boolean(params.state?.trim()) ||
    Boolean(params.gst?.trim()) ||
    Boolean(params.categoryId?.trim()) ||
    Boolean(params.tag?.trim());

  if (!hasFilters) {
    return [];
  }

  let results = await prisma.visitingCard.findMany({
    where: { AND: andConditions },
    orderBy: buildOrderBy(params.sort),
    take: 100,
    include: {
      category: {
        select: { id: true, name: true, color: true },
      },
    },
  });

  if (params.tag?.trim()) {
    results = results.filter((card) => matchesTag(card, params.tag!.trim()));
  }

  if (generalQuery) {
    const existingIds = new Set(results.map((card) => card.id));
    const tagMatches = await prisma.visitingCard.findMany({
      where: {
        userId,
        id: { notIn: [...existingIds] },
      },
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    results = [
      ...results,
      ...tagMatches.filter((card) => matchesTag(card, generalQuery)),
    ];
  }

  return sortResults(results, params.sort);
}

function sortResults<
  T extends {
    name: string;
    company: string | null;
    updatedAt: Date;
    createdAt: Date;
  },
>(results: T[], sort: SearchSortValue): T[] {
  const sorted = [...results];

  switch (sort) {
    case "updatedAsc":
      return sorted.sort(
        (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()
      );
    case "nameAsc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "nameDesc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "companyAsc":
      return sorted.sort((a, b) =>
        (a.company ?? "").localeCompare(b.company ?? "")
      );
    case "createdDesc":
      return sorted.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    case "updatedDesc":
    default:
      return sorted.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );
  }
}

export function getSearchTerms(input: SearchQueryInput): string[] {
  const params = searchQuerySchema.parse(input);
  const terms = [
    params.q,
    params.name,
    params.company,
    params.phone,
    params.email,
    params.city,
    params.state,
    params.gst,
    params.tag,
  ]
    .map((value) => value?.trim())
    .filter(Boolean) as string[];

  return [...new Set(terms)];
}
