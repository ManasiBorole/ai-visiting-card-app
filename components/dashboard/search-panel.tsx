"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, Mail, Phone, Search } from "lucide-react";

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
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/utils";

type SearchResult = {
  id: string;
  name: string;
  company: string | null;
  designation: string | null;
  mobile: string | null;
  email: string | null;
  city: string | null;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
};

type SearchPanelProps = {
  initialQuery: string;
  results: SearchResult[];
};

export function SearchPanel({ initialQuery, results }: SearchPanelProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      router.push(ROUTES.search);
      return;
    }

    router.push(`${ROUTES.search}?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Search contacts</CardTitle>
          <CardDescription>
            Search by name, company, email, phone, or city
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search your CRM..."
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            {initialQuery
              ? `${results.length} result${results.length === 1 ? "" : "s"} for "${initialQuery}"`
              : "Enter a query to search your contacts"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!initialQuery ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Use the search bar above to find contacts.
            </p>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No contacts matched your search.
            </p>
          ) : (
            results.map((result) => (
              <article
                key={result.id}
                className="rounded-xl border border-border/60 p-4 transition-colors hover:border-border hover:bg-muted/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{result.name}</h3>
                    {result.company ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {result.company}
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
                      {result.category.name}
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {result.mobile ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      {result.mobile}
                    </span>
                  ) : null}
                  {result.email ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-3.5" />
                      {result.email}
                    </span>
                  ) : null}
                  {result.designation ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="size-3.5" />
                      {result.designation}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Updated {formatDate(result.updatedAt)}
                </p>
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
