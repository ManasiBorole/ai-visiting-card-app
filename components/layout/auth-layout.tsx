import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { APP_TAGLINE, ROUTES } from "@/lib/constants";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-full flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-0 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 size-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-64 vault-gradient opacity-[0.04]" />
      </div>

      <header className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.home}>
          <BrandLogo size="sm" subtitle={APP_TAGLINE} />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
