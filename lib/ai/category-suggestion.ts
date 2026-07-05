import type { AiConfidence, CategorySuggestion, ContactFields } from "@/lib/ai/types";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

const CATEGORY_SIGNALS: Record<string, string[]> = {
  Client: [
    "client",
    "customer",
    "buyer",
    "account",
    "enterprise",
    "corporate",
    "business partner",
  ],
  Vendor: [
    "vendor",
    "supplier",
    "procurement",
    "distributor",
    "wholesale",
    "manufacturer",
    "dealer",
  ],
  Business: [
    "business",
    "partner",
    "collaboration",
    "networking",
    "professional",
    "commercial",
    "b2b",
  ],
  Personal: [
    "personal",
    "friend",
    "family",
    "colleague",
    "referral",
    "social",
  ],
};

function buildCorpus(contact: ContactFields) {
  return [
    contact.company,
    contact.designation,
    contact.notes,
    contact.website,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function suggestCategory(
  contact: ContactFields,
  categories: CategoryOption[]
): CategorySuggestion | null {
  if (categories.length === 0) return null;

  const corpus = buildCorpus(contact);
  if (!corpus.trim()) return null;

  let best: CategorySuggestion | null = null;
  let bestScore = 0;

  for (const category of categories) {
    const signals = CATEGORY_SIGNALS[category.name] ?? [
      category.name.toLowerCase(),
    ];
    const matched = signals.filter((signal) => corpus.includes(signal));

    if (matched.length === 0) continue;

    const confidence: AiConfidence =
      matched.length >= 2 ? "high" : "medium";

    if (matched.length > bestScore) {
      bestScore = matched.length;
      best = {
        categoryId: category.id,
        categoryName: category.name,
        color: category.color,
        confidence,
        reason: `Matched signals: ${matched.slice(0, 2).join(", ")}`,
      };
    }
  }

  return best;
}
