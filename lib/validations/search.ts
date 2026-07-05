import { z } from "zod";

export const SEARCH_SORT_OPTIONS = [
  { value: "updatedDesc", label: "Recently updated" },
  { value: "updatedAsc", label: "Oldest updated" },
  { value: "nameAsc", label: "Name (A–Z)" },
  { value: "nameDesc", label: "Name (Z–A)" },
  { value: "companyAsc", label: "Company (A–Z)" },
  { value: "createdDesc", label: "Recently added" },
] as const;

export type SearchSortValue = (typeof SEARCH_SORT_OPTIONS)[number]["value"];

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  name: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  gst: z.string().optional(),
  categoryId: z.string().optional(),
  tag: z.string().optional(),
  sort: z
    .enum([
      "updatedDesc",
      "updatedAsc",
      "nameAsc",
      "nameDesc",
      "companyAsc",
      "createdDesc",
    ])
    .optional()
    .default("updatedDesc"),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

export const RECENT_SEARCHES_KEY = "vc-recent-searches";
export const MAX_RECENT_SEARCHES = 8;
