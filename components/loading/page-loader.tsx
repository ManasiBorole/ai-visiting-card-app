import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PageLoaderProps = {
  className?: string;
  message?: string;
};

export function PageLoader({
  className,
  message = "Loading...",
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-6",
        className
      )}
    >
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
