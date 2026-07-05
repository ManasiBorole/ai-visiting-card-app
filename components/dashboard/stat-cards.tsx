import {
  CalendarPlus,
  CreditCard,
  FolderOpen,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardsProps = {
  totalCards: number;
  todayAddedCards: number;
  weekAddedCards: number;
  activeCategories: number;
};

const stats = [
  {
    key: "totalCards",
    label: "Total cards",
    icon: CreditCard,
    accent: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "todayAddedCards",
    label: "Added today",
    icon: CalendarPlus,
    accent: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    key: "weekAddedCards",
    label: "Added this week",
    icon: TrendingUp,
    accent: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    key: "activeCategories",
    label: "Active categories",
    icon: FolderOpen,
    accent: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
  },
] as const;

export function StatCards({
  totalCards,
  todayAddedCards,
  weekAddedCards,
  activeCategories,
}: StatCardsProps) {
  const values = {
    totalCards,
    todayAddedCards,
    weekAddedCards,
    activeCategories,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const value = values[stat.key];

        return (
          <Card
            key={stat.key}
            className="overflow-hidden border-border/60 shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  stat.bg
                )}
              >
                <Icon className={cn("size-4", stat.accent)} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">{value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
