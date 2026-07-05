import Image from "next/image";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  subtitle?: string;
  className?: string;
};

const sizeMap = {
  sm: { icon: 32, text: "text-sm" },
  md: { icon: 36, text: "text-sm" },
  lg: { icon: 44, text: "text-base" },
} as const;

export function BrandLogo({
  size = "md",
  showText = true,
  subtitle,
  className,
}: BrandLogoProps) {
  const config = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative shrink-0 overflow-hidden rounded-xl shadow-lg shadow-primary/20 ring-1 ring-white/10"
        style={{ width: config.icon, height: config.icon }}
      >
        <Image
          src="/icons/icon.svg"
          alt={`${APP_NAME} logo`}
          fill
          className="object-cover"
          priority
        />
      </div>
      {showText ? (
        <div className="min-w-0">
          <p
            className={cn(
              "truncate font-semibold tracking-tight text-foreground",
              config.text
            )}
          >
            {APP_NAME}
          </p>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
