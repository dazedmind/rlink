"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SettingsFormSectionProps = {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export function SettingsFormSection({
  title,
  description,
  icon: Icon,
  children,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Changes",
}: SettingsFormSectionProps) {
  return (
    <form onSubmit={onSubmit} className="border border-border rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon size={16} className="text-primary" />
          </div>
        )}
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="p-6 flex flex-col gap-4">{children}</div>
      <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function FormField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
