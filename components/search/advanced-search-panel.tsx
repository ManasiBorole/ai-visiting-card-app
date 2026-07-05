"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Brain,
  Clock,
  Filter,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react";

import { HighlightMatch } from "@/components/search/highlight-match";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { ROUTES } from "@/lib/constants";
import {
  SEARCH_SORT_OPTIONS,
  type SearchSortValue,
} from "@/lib/validations/search";
import { formatDate } from "@/utils";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

export type SearchFilters = {
  q: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  gst: string;
  categoryId: string;
  tag: string;
  sort: SearchSortValue;
};

type SearchResult = {
  id: string;
  name: string;
  company: string | null;
  designation: string | null;
  mobile: string | null;
  alternateMobile: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  gstNumber: string | null;
  tags: unknown;
  updatedAt: string;
  category: CategoryOption | null;
};

type AdvancedSearchPanelProps = {
  categories: CategoryOption[];
  initialFilters: SearchFilters;
};

const FILTER_FIELDS: Array<{
  key: keyof Omit<SearchFilters, "sort">;
  label: string;
  placeholder: string;
}> = [
  { key: "name", label: "Name", placeholder: "Contact name" },
  { key: "company", label: "Company", placeholder: "Company name" },
  { key: "phone", label: "Phone", placeholder: "Mobile number" },
  { key: "email", label: "Email", placeholder: "Email address" },
  { key: "city", label: "City", placeholder: "City" },
  { key: "state", label: "State", placeholder: "State" },
  { key: "gst", label: "GST", placeholder: "GST number" },
  { key: "tag", label: "Tags", placeholder: "Tag keyword" },
];

function cardTags(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === "string");
  }
  return [];
}

function hasActiveFilters(filters: SearchFilters) {
  return (
    Boolean(filters.q.trim()) ||
    Boolean(filters.name.trim()) ||
    Boolean(filters.company.trim()) ||
    Boolean(filters.phone.trim()) ||
    Boolean(filters.email.trim()) ||
    Boolean(filters.city.trim()) ||
    Boolean(filters.state.trim()) ||
    Boolean(filters.gst.trim()) ||
    Boolean(filters.categoryId.trim()) ||
    Boolean(filters.tag.trim())
  );
}

function buildSearchQuery(filters: SearchFilters) {
  const params = new URLSearchParams();

  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.name.trim()) params.set("name", filters.name.trim());
  if (filters.company.trim()) params.set("company", filters.company.trim());
  if (filters.phone.trim()) params.set("phone", filters.phone.trim());
  if (filters.email.trim()) params.set("email", filters.email.trim());
  if (filters.city.trim()) params.set("city", filters.city.trim());
  if (filters.state.trim()) params.set("state", filters.state.trim());
  if (filters.gst.trim()) params.set("gst", filters.gst.trim());
  if (filters.categoryId.trim()) {
    params.set("categoryId", filters.categoryId.trim());
  }
  if (filters.tag.trim()) params.set("tag", filters.tag.trim());
  if (filters.sort !== "updatedDesc") params.set("sort", filters.sort);

  return params.toString();
}

function buildSearchLabel(
  filters: SearchFilters,
  categories: CategoryOption[]
) {
  const parts: string[] = [];

  if (filters.q.trim()) parts.push(filters.q.trim());
  if (filters.name.trim()) parts.push(`Name: ${filters.name.trim()}`);
  if (filters.company.trim()) parts.push(`Company: ${filters.company.trim()}`);
  if (filters.phone.trim()) parts.push(`Phone: ${filters.phone.trim()}`);
  if (filters.email.trim()) parts.push(`Email: ${filters.email.trim()}`);
  if (filters.city.trim()) parts.push(`City: ${filters.city.trim()}`);
  if (filters.state.trim()) parts.push(`State: ${filters.state.trim()}`);
  if (filters.gst.trim()) parts.push(`GST: ${filters.gst.trim()}`);
  if (filters.tag.trim()) parts.push(`Tag: ${filters.tag.trim()}`);

  if (filters.categoryId.trim()) {
    const category = categories.find(
      (item) => item.id === filters.categoryId.trim()
    );
    parts.push(`Category: ${category?.name ?? "Selected"}`);
  }

  return parts.join(" · ");
}

function countActiveFilters(filters: SearchFilters) {
  let count = 0;

  if (filters.name.trim()) count += 1;
  if (filters.company.trim()) count += 1;
  if (filters.phone.trim()) count += 1;
  if (filters.email.trim()) count += 1;
  if (filters.city.trim()) count += 1;
  if (filters.state.trim()) count += 1;
  if (filters.gst.trim()) count += 1;
  if (filters.categoryId.trim()) count += 1;
  if (filters.tag.trim()) count += 1;

  return count;
}

export function AdvancedSearchPanel({
  categories,
  initialFilters,
}: AdvancedSearchPanelProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(
    countActiveFilters(initialFilters) > 0
  );
  const [results, setResults] = useState<SearchResult[]>([]);
  const [highlightTerms, setHighlightTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSavedQuery = useRef<string | null>(null);
  const [smartMode, setSmartMode] = useState(true);
  const [smartInterpretation, setSmartInterpretation] = useState<string | null>(
    null
  );

  const debouncedFilters = useDebouncedValue(filters, 300);
  const debouncedQuery = useDebouncedValue(buildSearchQuery(filters), 300);
  const activeFilters = hasActiveFilters(filters);
  const advancedFilterCount = countActiveFilters(filters);
  const searchLabel = useMemo(
    () => buildSearchLabel(filters, categories),
    [filters, categories]
  );

  const { recentSearches, addRecentSearch, clearRecentSearches } =
    useRecentSearches();

  const updateFilter = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      setFilters((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters((current) => ({
      ...current,
      q: "",
      name: "",
      company: "",
      phone: "",
      email: "",
      city: "",
      state: "",
      gst: "",
      categoryId: "",
      tag: "",
    }));
  }, []);

  const applyRecentSearch = useCallback((query: string) => {
    const params = new URLSearchParams(query);
    setFilters({
      q: params.get("q") ?? "",
      name: params.get("name") ?? "",
      company: params.get("company") ?? "",
      phone: params.get("phone") ?? "",
      email: params.get("email") ?? "",
      city: params.get("city") ?? "",
      state: params.get("state") ?? "",
      gst: params.get("gst") ?? "",
      categoryId: params.get("categoryId") ?? "",
      tag: params.get("tag") ?? "",
      sort: (params.get("sort") as SearchSortValue) ?? "updatedDesc",
    });
    setShowFilters(countActiveFilters({
      q: params.get("q") ?? "",
      name: params.get("name") ?? "",
      company: params.get("company") ?? "",
      phone: params.get("phone") ?? "",
      email: params.get("email") ?? "",
      city: params.get("city") ?? "",
      state: params.get("state") ?? "",
      gst: params.get("gst") ?? "",
      categoryId: params.get("categoryId") ?? "",
      tag: params.get("tag") ?? "",
      sort: (params.get("sort") as SearchSortValue) ?? "updatedDesc",
    }) > 0);
  }, []);

  useEffect(() => {
    const nextUrl = debouncedQuery
      ? `${ROUTES.search}?${debouncedQuery}`
      : ROUTES.search;

    router.replace(nextUrl, { scroll: false });
  }, [debouncedQuery, router]);

  useEffect(() => {
    if (!hasActiveFilters(debouncedFilters)) {
      setResults([]);
      setHighlightTerms([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function runSearch() {
      setLoading(true);
      setError(null);

      try {
        const manualFilters = countActiveFilters(debouncedFilters);
        const useSmartSearch =
          smartMode &&
          debouncedFilters.q.trim() &&
          manualFilters === 0;

        if (useSmartSearch) {
          const response = await fetch("/api/ai/smart-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: debouncedFilters.q.trim() }),
            signal: controller.signal,
          });
          const payload = await response.json();

          if (!response.ok || !payload.success) {
            throw new Error(payload.error ?? "Smart search failed");
          }

          setResults(payload.data);
          setHighlightTerms(payload.meta?.highlightTerms ?? []);
          setSmartInterpretation(payload.meta?.smartSearch?.interpretation ?? null);
          return;
        }

        setSmartInterpretation(null);
        const query = buildSearchQuery(debouncedFilters);
        const response = await fetch(`/api/search?${query}`, {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.error ?? "Search failed");
        }

        setResults(payload.data);
        setHighlightTerms(payload.meta?.highlightTerms ?? []);

        if (query && query !== lastSavedQuery.current) {
          const label = buildSearchLabel(debouncedFilters, categories);
          if (label) {
            addRecentSearch(label, query);
            lastSavedQuery.current = query;
          }
        }
      } catch (searchError) {
        if (searchError instanceof DOMException && searchError.name === "AbortError") {
          return;
        }

        setError("Unable to search contacts right now.");
        setResults([]);
        setHighlightTerms([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    runSearch();

    return () => controller.abort();
  }, [debouncedFilters, categories, addRecentSearch, smartMode]);

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Advanced search</CardTitle>
          <CardDescription>
            Instant search across name, company, phone, email, city, state, GST,
            category, and tags
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.q}
                onChange={(event) => updateFilter("q", event.target.value)}
                placeholder="Search everything..."
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={smartMode ? "default" : "outline"}
                className="gap-2"
                onClick={() => setSmartMode((current) => !current)}
              >
                <Brain className="size-4" />
                Smart search
              </Button>

              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => setShowFilters((current) => !current)}
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {advancedFilterCount > 0 ? (
                  <Badge variant="secondary">{advancedFilterCount}</Badge>
                ) : null}
              </Button>

              <Select
                value={filters.sort}
                onChange={(event) =>
                  updateFilter("sort", event.target.value as SearchSortValue)
                }
                className="min-w-[180px]"
                aria-label="Sort results"
              >
                {SEARCH_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {showFilters ? (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Filter className="size-4" />
                  Filter contacts
                </div>
                {advancedFilterCount > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={clearFilters}
                  >
                    <X className="size-3.5" />
                    Clear filters
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {FILTER_FIELDS.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={`search-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`search-${field.key}`}
                      value={filters[field.key]}
                      onChange={(event) =>
                        updateFilter(field.key, event.target.value)
                      }
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <Label htmlFor="search-category">Category</Label>
                  <Select
                    id="search-category"
                    value={filters.categoryId}
                    onChange={(event) =>
                      updateFilter("categoryId", event.target.value)
                    }
                  >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          ) : null}

          {smartInterpretation ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <span className="font-medium text-primary">Smart search: </span>
              {smartInterpretation}
            </div>
          ) : null}

          {recentSearches.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="size-4" />
                  Recent searches
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                >
                  Clear
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((entry) => (
                  <Button
                    key={entry.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto max-w-full py-1.5 text-left whitespace-normal"
                    onClick={() => applyRecentSearch(entry.query)}
                  >
                    {entry.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            {!activeFilters ? (
              "Start typing or apply filters to search your contacts"
            ) : loading ? (
              "Searching..."
            ) : error ? (
              error
            ) : (
              <>
                {results.length} result{results.length === 1 ? "" : "s"}
                {searchLabel ? (
                  <>
                    {" "}
                    for <span className="font-medium text-foreground">{searchLabel}</span>
                  </>
                ) : null}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!activeFilters ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Use the search bar or filters above to find contacts instantly.
            </p>
          ) : loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-destructive">{error}</p>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No contacts matched your search.
            </p>
          ) : (
            results.map((result) => {
              const tags = cardTags(result.tags);

              return (
                <article
                  key={result.id}
                  className="rounded-xl border border-border/60 p-4 transition-colors hover:border-border hover:bg-muted/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium">
                        <HighlightMatch
                          text={result.name}
                          terms={highlightTerms}
                        />
                      </h3>
                      {result.company ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          <HighlightMatch
                            text={result.company}
                            terms={highlightTerms}
                          />
                        </p>
                      ) : null}
                      {result.designation ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {result.designation}
                        </p>
                      ) : null}
                    </div>
                    {result.category ? (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: `${result.category.color}40`,
                          color: result.category.color,
                          backgroundColor: `${result.category.color}12`,
                        }}
                      >
                        <HighlightMatch
                          text={result.category.name}
                          terms={highlightTerms}
                        />
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {result.mobile ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        <HighlightMatch
                          text={result.mobile}
                          terms={highlightTerms}
                        />
                      </span>
                    ) : null}
                    {result.alternateMobile ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        <HighlightMatch
                          text={result.alternateMobile}
                          terms={highlightTerms}
                        />
                      </span>
                    ) : null}
                    {result.email ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="size-3.5" />
                        <HighlightMatch
                          text={result.email}
                          terms={highlightTerms}
                        />
                      </span>
                    ) : null}
                    {result.city || result.state ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        <HighlightMatch
                          text={[result.city, result.state]
                            .filter(Boolean)
                            .join(", ")}
                          terms={highlightTerms}
                        />
                      </span>
                    ) : null}
                    {result.gstNumber ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="size-3.5" />
                        GST{" "}
                        <HighlightMatch
                          text={result.gstNumber}
                          terms={highlightTerms}
                        />
                      </span>
                    ) : null}
                  </div>

                  {tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          <Tag className="size-3" />
                          <HighlightMatch text={tag} terms={highlightTerms} />
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDate(result.updatedAt)}
                    </p>
                    <Link
                      href={ROUTES.cardDetail(result.id)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View contact
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </CardContent>
      </Card>

      {loading && activeFilters ? (
        <div className="pointer-events-none fixed right-6 bottom-6 flex items-center gap-2 rounded-full border border-border/60 bg-background/95 px-4 py-2 text-sm shadow-lg backdrop-blur">
          <Loader2 className="size-4 animate-spin" />
          Searching...
        </div>
      ) : null}
    </div>
  );
}
