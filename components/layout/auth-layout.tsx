import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { APP_NAME, ROUTES } from "@/lib/constants";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-full flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-0 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 size-96 rounded-full bg-chart-1/10 blur-3xl" />
      </div>

      <header className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.home} className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <span className="text-xs font-bold tracking-tight">VC</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
