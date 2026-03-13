"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import type {
  InventoryUnit,
  ProjectModel,
} from "@/app/home/cms/listings/projects/tabs/project-types";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </Label>
  );
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(val);
}

type InventoryUnitFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: Omit<InventoryUnit, "id">) => void;
  unit?: InventoryUnit | null;
  models: ProjectModel[];
};

export default function InventoryUnitFormModal({
  isOpen,
  onClose,
  onSave,
  unit,
  models,
}: InventoryUnitFormModalProps) {
  const isEdit = unit != null;
  const [inventoryCode, setInventoryCode] = useState("");
  const [modelId, setModelId] = useState("");
  const [block, setBlock] = useState(0);
  const [lot, setLot] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (unit) {
      setInventoryCode(unit.inventoryCode);
      setModelId(unit.modelId);
      setBlock(unit.block);
      setLot(unit.lot);
      setSellingPrice(unit.sellingPrice);
      setIsFeatured(unit.isFeatured);
    } else {
      setInventoryCode("");
      setModelId(models[0]?.id ?? "");
      setBlock(0);
      setLot(0);
      setSellingPrice(0);
      setIsFeatured(false);
    }
  }, [unit, models, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelId) return;
    onSave({
      modelId,
      inventoryCode: inventoryCode.trim(),
      block,
      lot,
      sellingPrice,
      isFeatured,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Unit" : "Add Unit"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Inventory Code *</FieldLabel>
            <input
              type="text"
              value={inventoryCode}
              placeholder="e.g. AR-B1-L5"
              onChange={(e) => setInventoryCode(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring font-mono"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>House Model *</FieldLabel>
            {models.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                No models defined yet. Add models first.
              </p>
            ) : (
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
              >
                <option value="">Select model</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.modelName || `Model ${m.id}`}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Block</FieldLabel>
              <input
                type="number"
                value={block || ""}
                placeholder="0"
                min={0}
                onChange={(e) => setBlock(Number(e.target.value) || 0)}
                className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Lot</FieldLabel>
              <input
                type="number"
                value={lot || ""}
                placeholder="0"
                min={0}
                onChange={(e) => setLot(Number(e.target.value) || 0)}
                className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Selling Price (PHP)</FieldLabel>
            <input
              type="number"
              value={sellingPrice || ""}
              placeholder="0"
              min={0}
              onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
              className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
            />
            {sellingPrice > 0 && (
              <p className="text-[11px] text-muted-foreground">
                {formatCurrency(sellingPrice)}
              </p>
            )}
          </div>
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div
              role="switch"
              aria-checked={isFeatured}
              onClick={() => setIsFeatured(!isFeatured)}
              className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${
                isFeatured ? "bg-primary" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  isFeatured ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm font-medium select-none">Featured unit</span>
            {isFeatured && (
              <Star size={13} className="text-yellow-500 fill-yellow-400" />
            )}
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!modelId}>
              {isEdit ? "Save Changes" : "Add Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
