import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_DESCRIPTION, APP_NAME, ROUTES } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-sm sm:p-12">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-primary/5 to-transparent lg:block" />
        <div className="relative max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            AI-powered card management
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {APP_NAME}
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {APP_DESCRIPTION}. Securely store, organize, and access every
              visiting card from one premium dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={ROUTES.signup}>
              <Button className="w-full gap-2 sm:w-auto">
                Get started
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href={ROUTES.login}>
              <Button variant="outline" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Secure accounts",
            description:
              "Email authentication with Google OAuth ready for seamless sign-in.",
          },
          {
            title: "Your card library",
            description:
              "Every visiting card is linked to your account and organized by category.",
          },
          {
            title: "Activity tracking",
            description:
              "Full audit trail of logins, updates, and card management actions.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-colors hover:border-border"
          >
            <h2 className="text-sm font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
