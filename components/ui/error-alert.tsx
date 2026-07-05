import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

type ErrorAlertProps = {
  title?: string;
  message: string;
  className?: string;
};

export function ErrorAlert({
  title = "Something went wrong",
  message,
  className,
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-destructive/90">{message}</p>
        </div>
      </div>
    </div>
  );
}
