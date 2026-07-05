import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { getAllUserCards } from "@/services/dashboard.service";
import { formatDate } from "@/utils";

export const metadata: Metadata = {
  title: "All Cards",
};

export default async function AllCardsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const cards = await getAllUserCards(session.user.id);

  return (
    <DashboardShell
      title="All Cards"
      subtitle={`${cards.length} contacts in your CRM library`}
      userName={session.user.name}
    >
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Contact directory</CardTitle>
          <Link href={ROUTES.cardsNew}>
            <Button size="sm" className="gap-2">
              <Plus className="size-4" />
              Add card
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {cards.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No visiting cards found. Upload your first card to populate this
              view.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Company</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium">Mobile</th>
                    <th className="pb-3 pr-4 font-medium">City</th>
                    <th className="pb-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card) => (
                    <tr
                      key={card.id}
                      className="border-b border-border/40 transition-colors hover:bg-muted/20"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={ROUTES.cardDetail(card.id)}
                          className="group block"
                        >
                          <div className="font-medium group-hover:text-primary">
                            {card.name}
                          </div>
                          {card.designation ? (
                            <div className="text-xs text-muted-foreground">
                              {card.designation}
                            </div>
                          ) : null}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <Link
                          href={ROUTES.cardDetail(card.id)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {card.company ?? "—"}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        {card.category ? (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: `${card.category.color}40`,
                              color: card.category.color,
                              backgroundColor: `${card.category.color}12`,
                            }}
                          >
                            {card.category.name}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {card.mobile ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {card.city ?? "—"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(card.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
