"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

const THEMES = [
  {
    value: "light",
    label: "Light mode",
    description: "Bright interface for daytime use",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark mode",
    description: "Reduced glare for low-light environments",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Follow your device appearance setting",
    icon: Monitor,
  },
] as const;

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose light mode, dark mode, or system theme</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        {THEMES.map((option) => {
          const Icon = option.icon;
          const isActive = mounted && theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={!mounted}
              onClick={() => setTheme(option.value)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                isActive
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border/60 hover:border-border hover:bg-muted/20"
              )}
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <p className="font-medium">{option.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {option.description}
              </p>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
