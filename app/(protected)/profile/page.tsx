import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Building2,
  Calendar,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  User as UserIcon,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/auth";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/utils";
import { getUserProfile } from "@/services/user.service";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const profile = await getUserProfile(session.user.id);

  if (!profile) {
    redirect(ROUTES.login);
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Profile
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {profile.name}
            </h1>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
          <LogoutButton variant="outline" />
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<CreditCard className="size-5 text-primary" />}
            label="Visiting cards"
            value={profile._count.visitingCards.toString()}
          />
          <StatCard
            icon={<Calendar className="size-5 text-primary" />}
            label="Activity logs"
            value={profile._count.activityLogs.toString()}
          />
          <StatCard
            icon={<UserIcon className="size-5 text-primary" />}
            label="Member since"
            value={formatDate(profile.createdAt)}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Your visiting cards</CardTitle>
              <CardDescription>
                Cards linked to your account ({profile._count.visitingCards}{" "}
                total)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.visitingCards.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No visiting cards yet. Cards you add will appear here.
                </p>
              ) : (
                profile.visitingCards.map((card) => (
                  <article
                    key={card.id}
                    className="rounded-xl border border-border/60 p-4 transition-colors hover:border-border"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium">{card.name}</h3>
                        {card.company ? (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Building2 className="size-3.5" />
                            {card.company}
                          </p>
                        ) : null}
                        {card.designation ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {card.designation}
                          </p>
                        ) : null}
                      </div>
                      {card.category ? (
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: `${card.category.color}20`,
                            color: card.category.color,
                          }}
                        >
                          {card.category.name}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {card.mobile ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="size-3" />
                          {card.mobile}
                        </span>
                      ) : null}
                      {card.email ? (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="size-3" />
                          {card.email}
                        </span>
                      ) : null}
                      {card.city ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" />
                          {card.city}
                        </span>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                Latest actions on your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.activityLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activity recorded yet.
                </p>
              ) : (
                profile.activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between gap-4 border-b border-border/40 pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{log.action}</p>
                      {log.visitingCard ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {log.visitingCard.name}
                        </p>
                      ) : null}
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(log.date)}
                    </time>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
