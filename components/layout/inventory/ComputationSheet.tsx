"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { InventoryItem, Project } from "@/lib/types";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(n);

type ComputationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  model: string;
  project: Project;
};

export function ComputationSheet({
  open,
  onOpenChange,
  item,
  model,
  project,
}: ComputationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Computation Details</SheetTitle>
        </SheetHeader>
        {item && (
          <div className="space-y-6 p-4">
            <div className="rounded-lg border border-border p-4 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Unit Details
              </h3>
              <dl className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Project</dt>
                  <dd className="font-medium">{project.projectName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Inventory Code</dt>
                  <dd className="font-mono text-xs">{item.inventoryCode}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Block / Lot</dt>
                  <dd className="font-medium">
                    Block {item.block} • Lot {item.lot}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Model</dt>
                  <dd className="font-medium">{model}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-lg border border-border p-4 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Price
              </h3>
              <div className="flex justify-between items-baseline">
                <span className="text-muted-foreground">Selling Price</span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(item.sellingPrice)}
                </span>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
