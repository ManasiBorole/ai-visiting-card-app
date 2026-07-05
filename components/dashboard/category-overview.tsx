import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

type CategoryItem = {
  id: string;
  name: string;
  color: string;
  count: number;
};

type CategoryOverviewProps = {
  categories: CategoryItem[];
};

export function CategoryOverview({ categories }: CategoryOverviewProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Organize contacts by relationship type</CardDescription>
        </div>
        <Link
          href={ROUTES.categories}
          className="text-sm font-medium text-primary hover:underline"
        >
          Manage
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No categories available.
          </p>
        ) : (
          categories.map((category) => (
            <Link key={category.id} href={ROUTES.categoryDetail(category.id)}>
              <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 transition-colors hover:border-border hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <Badge variant="secondary">{category.count}</Badge>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
