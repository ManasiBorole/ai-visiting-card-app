import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  AdvancedSearchPanel,
  type SearchFilters,
} from "@/components/search/advanced-search-panel";
import { ROUTES } from "@/lib/constants";
import type { SearchSortValue } from "@/lib/validations/search";
import { getCategoriesForSelect } from "@/services/visiting-card.service";

export const metadata: Metadata = {
  title: "Search",
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    name?: string;
    company?: string;
    phone?: string;
    email?: string;
    city?: string;
    state?: string;
    gst?: string;
    categoryId?: string;
    tag?: string;
    sort?: SearchSortValue;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const params = await searchParams;
  const categories = await getCategoriesForSelect(session.user.id);

  const initialFilters: SearchFilters = {
    q: params.q ?? "",
    name: params.name ?? "",
    company: params.company ?? "",
    phone: params.phone ?? "",
    email: params.email ?? "",
    city: params.city ?? "",
    state: params.state ?? "",
    gst: params.gst ?? "",
    categoryId: params.categoryId ?? "",
    tag: params.tag ?? "",
    sort: params.sort ?? "updatedDesc",
  };

  return (
    <DashboardShell
      title="Search"
      subtitle="Find contacts across your visiting card library"
      userName={session.user.name}
    >
      <AdvancedSearchPanel
        categories={categories}
        initialFilters={initialFilters}
      />
    </DashboardShell>
  );
}
