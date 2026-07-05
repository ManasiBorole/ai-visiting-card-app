import type { AiConfidence, BusinessTypeResult, ContactFields } from "@/lib/ai/types";

const BUSINESS_RULES: Array<{
  type: string;
  keywords: string[];
}> = [
  {
    type: "Technology / SaaS",
    keywords: [
      "tech",
      "software",
      "saas",
      "digital",
      "cloud",
      "data",
      "cyber",
      "ai ",
      "artificial intelligence",
      "solutions",
      "systems",
      "platform",
      "developer",
      "engineering",
    ],
  },
  {
    type: "Creative / Marketing Agency",
    keywords: [
      "agency",
      "creative",
      "design",
      "media",
      "marketing",
      "brand",
      "studio",
      "advert",
      "content",
      "communications",
    ],
  },
  {
    type: "Consulting / Professional Services",
    keywords: [
      "consult",
      "advisory",
      "services",
      "legal",
      "finance",
      "audit",
      "account",
      "strategy",
      "management",
      "partners",
    ],
  },
  {
    type: "Manufacturing / Industrial",
    keywords: [
      "manufact",
      "industrial",
      "factory",
      "engineering works",
      "automotive",
      "machinery",
      "steel",
      "chemical",
      "textile",
    ],
  },
  {
    type: "Healthcare / Pharma",
    keywords: [
      "health",
      "hospital",
      "medical",
      "pharma",
      "clinic",
      "diagnostic",
      "care",
      "wellness",
    ],
  },
  {
    type: "Retail / E-commerce",
    keywords: [
      "retail",
      "store",
      "shop",
      "commerce",
      "ecommerce",
      "e-commerce",
      "mart",
      "traders",
      "distributors",
    ],
  },
  {
    type: "Real Estate / Construction",
    keywords: [
      "real estate",
      "property",
      "construction",
      "builders",
      "infra",
      "architect",
      "housing",
    ],
  },
  {
    type: "Education / Training",
    keywords: [
      "education",
      "university",
      "school",
      "college",
      "academy",
      "training",
      "institute",
      "learning",
    ],
  },
  {
    type: "Finance / Banking",
    keywords: [
      "bank",
      "finance",
      "capital",
      "investment",
      "insurance",
      "wealth",
      "credit",
      "fintech",
    ],
  },
];

function buildCorpus(contact: ContactFields) {
  return [
    contact.company,
    contact.designation,
    contact.website,
    contact.notes,
    contact.address,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function detectBusinessType(contact: ContactFields): BusinessTypeResult | null {
  const corpus = buildCorpus(contact);
  if (!corpus.trim()) return null;

  let best: BusinessTypeResult | null = null;

  for (const rule of BUSINESS_RULES) {
    const signals = rule.keywords.filter((keyword) => corpus.includes(keyword));
    if (signals.length === 0) continue;

    const confidence: AiConfidence =
      signals.length >= 2 ? "high" : signals.length === 1 ? "medium" : "low";

    if (!best || signals.length > best.signals.length) {
      best = {
        type: rule.type,
        confidence,
        signals: signals.slice(0, 3),
      };
    }
  }

  return best;
}
