"use client";

import { cn } from "@/lib/utils";

function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => onOpenChange(false)}
          aria-hidden
        />
      ) : null}
      {children}
    </>
  );
}

function SheetContent({
  open,
  onOpenChange,
  className,
  children,
}: SheetContentProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {children}
      </aside>
    </Sheet>
  );
}

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

type SheetContentProps = SheetProps & {
  className?: string;
};

export { Sheet, SheetContent };
