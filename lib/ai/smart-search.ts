import type { SmartSearchParseResult } from "@/lib/ai/types";

type CategoryOption = {
  id: string;
  name: string;
};

const CITY_ALIASES: Record<string, string> = {
  bengaluru: "Bangalore",
  bangalore: "Bangalore",
  mumbai: "Mumbai",
  bombay: "Mumbai",
  delhi: "Delhi",
  ncr: "Delhi",
  noida: "Noida",
  gurgaon: "Gurgaon",
  gurugram: "Gurgaon",
  hyderabad: "Hyderabad",
  chennai: "Chennai",
  pune: "Pune",
  kolkata: "Kolkata",
  ahmedabad: "Ahmedabad",
};

const CATEGORY_ALIASES: Record<string, string[]> = {
  client: ["client", "clients", "customer", "customers"],
  vendor: ["vendor", "vendors", "supplier", "suppliers"],
  business: ["business", "partner", "partners", "corporate"],
  personal: ["personal", "friend", "friends", "family"],
};

const ROLE_KEYWORDS = [
  "ceo",
  "cto",
  "cfo",
  "director",
  "manager",
  "founder",
  "president",
  "engineer",
  "consultant",
];

function cleanQuery(query: string) {
  return query.trim().replace(/\s{2,}/g, " ");
}

function findCategoryId(categories: CategoryOption[], query: string) {
  const lower = query.toLowerCase();

  for (const category of categories) {
    const aliases = CATEGORY_ALIASES[category.name.toLowerCase()] ?? [
      category.name.toLowerCase(),
    ];

    if (aliases.some((alias) => lower.includes(alias))) {
      return category;
    }
  }

  return null;
}

function extractCity(query: string) {
  const inMatch = query.match(/\b(?:in|from|at)\s+([a-zA-Z\s]+?)(?:\s+(?:with|who|contacts|cards|companies)|$)/i);
  const candidate = inMatch?.[1]?.trim().toLowerCase();

  if (candidate && CITY_ALIASES[candidate]) {
    return CITY_ALIASES[candidate];
  }

  for (const [alias, city] of Object.entries(CITY_ALIASES)) {
    if (query.toLowerCase().includes(alias)) {
      return city;
    }
  }

  return undefined;
}

function extractCompany(query: string) {
  const match = query.match(
    /\b(?:company|companies|from|at)\s+([a-zA-Z0-9&.\-\s]{2,40})/i
  );
  return match?.[1]?.trim();
}

function extractRole(query: string) {
  const lower = query.toLowerCase();
  return ROLE_KEYWORDS.find((role) => lower.includes(role));
}

function extractEmail(query: string) {
  const match = query.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match?.[0];
}

function extractPhone(query: string) {
  const match = query.match(/(?:\+?\d[\d\s\-()]{7,}\d)/);
  return match?.[0]?.trim();
}

export function parseSmartSearchQuery(
  query: string,
  categories: CategoryOption[] = []
): SmartSearchParseResult {
  const cleaned = cleanQuery(query);
  const lower = cleaned.toLowerCase();
  const filters: SmartSearchParseResult["filters"] = {};
  const keywords: string[] = [];

  const category = findCategoryId(categories, lower);
  if (category) {
    filters.categoryId = category.id;
    keywords.push(category.name);
  }

  const city = extractCity(lower);
  if (city) {
    filters.city = city;
    keywords.push(city);
  }

  const company = extractCompany(cleaned);
  if (company && !city) {
    filters.company = company;
    keywords.push(company);
  }

  const email = extractEmail(cleaned);
  if (email) {
    filters.email = email;
    keywords.push(email);
  }

  const phone = extractPhone(cleaned);
  if (phone) {
    filters.phone = phone;
    keywords.push(phone);
  }

  const role = extractRole(lower);
  if (role) {
    filters.q = role;
    keywords.push(role);
  }

  if (
    lower.includes("gst") ||
    /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]\b/i.test(cleaned)
  ) {
    const gstMatch = cleaned.match(
      /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]\b/i
    );
    filters.gst = gstMatch?.[0] ?? "GST";
    if (gstMatch?.[0]) keywords.push(gstMatch[0]);
  }

  if (Object.keys(filters).length === 0) {
    filters.q = cleaned;
  } else if (!filters.q && cleaned.length <= 60) {
    filters.q = cleaned;
  }

  const interpretationParts: string[] = [];

  if (category) interpretationParts.push(`Category: ${category.name}`);
  if (city) interpretationParts.push(`City: ${city}`);
  if (company) interpretationParts.push(`Company: ${company}`);
  if (role) interpretationParts.push(`Role keyword: ${role}`);
  if (email) interpretationParts.push(`Email: ${email}`);
  if (phone) interpretationParts.push(`Phone: ${phone}`);
  if (filters.gst) interpretationParts.push(`GST search`);

  return {
    interpretation:
      interpretationParts.length > 0
        ? interpretationParts.join(" · ")
        : `Searching for "${cleaned}"`,
    filters,
    keywords: [...new Set(keywords)],
  };
}
