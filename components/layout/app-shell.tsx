import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="relative flex min-h-full flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 size-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-24 top-32 size-96 rounded-full bg-chart-1/10 blur-3xl" />
      </div>
      <SiteHeader />
      <main className={cn("mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8", className)}>
        {children}
      </main>
    </div>
  );
}
