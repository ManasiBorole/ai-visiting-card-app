"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_COLOR_PRESETS } from "@/lib/validations/category";
import { cn } from "@/lib/utils";

type CategoryColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

export function CategoryColorPicker({ value, onChange }: CategoryColorPickerProps) {
  return (
    <div className="space-y-3">
      <Label>Category color</Label>
      <div className="flex flex-wrap gap-2">
        {CATEGORY_COLOR_PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Select color ${color}`}
            className={cn(
              "size-8 rounded-full border-2 transition-transform hover:scale-105",
              value.toLowerCase() === color.toLowerCase()
                ? "border-foreground ring-2 ring-ring/40"
                : "border-transparent"
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span
          className="size-8 shrink-0 rounded-full border border-border/60"
          style={{ backgroundColor: value }}
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#2563eb"
          className="max-w-[140px] font-mono text-sm"
        />
      </div>
    </div>
  );
}
