"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import type { InventoryUnit, ProjectModel } from "./project-types";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(val);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </Label>
  );
}

function InlineInput({
  value,
  placeholder,
  type = "text",
  onChange,
  className = "",
}: {
  value: string | number;
  placeholder: string;
  type?: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value === 0 ? "" : value}
      placeholder={placeholder}
      min={type === "number" ? 0 : undefined}
      onChange={(e) => onChange(e.target.value)}
      className={`h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring placeholder:text-muted-foreground ${className}`}
    />
  );
}

function NumberCell({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <SectionLabel>{label}</SectionLabel>
      <InlineInput
        type="number"
        value={value}
        placeholder="0"
        onChange={(v) => onChange(Number(v))}
      />
    </div>
  );
}

const EMPTY_UNIT: Omit<InventoryUnit, "id"> = {
  modelId: "",
  inventoryCode: "",
  block: 0,
  lot: 0,
  sellingPrice: 0,
  isFeatured: false,
};

function UnitCard({
  unit,
  index,
  isOpen,
  onToggle,
  onChange,
  onRemove,
  models,
}: {
  unit: InventoryUnit;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (u: InventoryUnit) => void;
  onRemove: () => void;
  models: ProjectModel[];
}) {
  const set = <K extends keyof InventoryUnit>(
    field: K,
    value: InventoryUnit[K]
  ) => onChange({ ...unit, [field]: value });

  const assignedModel = models.find((m) => m.id === unit.modelId);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer select-none hover:bg-slate-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 min-w-0">
          {unit.isFeatured && (
            <Star
              size={13}
              className="text-yellow-500 fill-yellow-400 shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold font-mono truncate">
              {unit.inventoryCode || (
                <span className="text-muted-foreground font-sans font-normal italic">
                  Unit {index + 1}
                </span>
              )}
            </p>
            {!isOpen && (
              <p className="text-xs text-muted-foreground">
                {[
                  assignedModel?.modelName,
                  unit.block > 0 && `Blk ${unit.block}`,
                  unit.lot > 0 && `Lot ${unit.lot}`,
                  unit.sellingPrice > 0 && formatCurrency(unit.sellingPrice),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          {isOpen ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 flex flex-col gap-4 border-t border-border bg-white">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <SectionLabel>Inventory Code *</SectionLabel>
              <InlineInput
                value={unit.inventoryCode}
                placeholder="e.g. AR-B1-L5"
                onChange={(v) => set("inventoryCode", v)}
                className="font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <SectionLabel>House Model *</SectionLabel>
              {models.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 h-10 flex items-center">
                  No models defined yet. Add models first.
                </p>
              ) : (
                <select
                  value={unit.modelId}
                  onChange={(e) => set("modelId", e.target.value)}
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberCell
              label="Block"
              value={unit.block}
              onChange={(n) => set("block", n)}
            />
            <NumberCell
              label="Lot"
              value={unit.lot}
              onChange={(n) => set("lot", n)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <SectionLabel>Selling Price (PHP)</SectionLabel>
            <InlineInput
              type="number"
              value={unit.sellingPrice}
              placeholder="0"
              onChange={(v) => set("sellingPrice", Number(v))}
            />
            {unit.sellingPrice > 0 && (
              <p className="text-[11px] text-muted-foreground">
                {formatCurrency(unit.sellingPrice)}
              </p>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div
              role="switch"
              aria-checked={unit.isFeatured}
              onClick={() => set("isFeatured", !unit.isFeatured)}
              className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${
                unit.isFeatured ? "bg-primary" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  unit.isFeatured ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm font-medium select-none">
              Featured unit
            </span>
            {unit.isFeatured && (
              <Star size={13} className="text-yellow-500 fill-yellow-400" />
            )}
          </label>
        </div>
      )}
    </div>
  );
}

type ProjectInventoryTabProps = {
  inventory: InventoryUnit[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryUnit[]>>;
  models: ProjectModel[];
  onSave: () => void;
  isSaving: boolean;
};

export default function ProjectInventoryTab({
  inventory,
  setInventory,
  models,
  onSave,
  isSaving,
}: ProjectInventoryTabProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const addUnit = () => {
    const newId = crypto.randomUUID();
    const defaultModelId = models[0]?.id ?? "";
    const newUnit: InventoryUnit = {
      id: newId,
      ...EMPTY_UNIT,
      modelId: defaultModelId,
    };
    setInventory((prev) => [...prev, newUnit]);
    setOpenIndex(inventory.length);
  };

  const updateUnit = (index: number, updated: InventoryUnit) => {
    setInventory((prev) =>
      prev.map((u, i) => (i === index ? updated : u))
    );
  };

  const removeUnit = (index: number) => {
    setInventory((prev) => prev.filter((_, i) => i !== index));
    setOpenIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return prev > 0 ? prev - 1 : 0;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">
          Inventory
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addUnit}
          disabled={models.length === 0}
          className="gap-2"
        >
          <Plus size={14} />
          Add Unit
        </Button>
      </div>

      {models.length === 0 && (
        <div className="text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
          Define at least one model in the Models tab before adding inventory
          units.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {inventory.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl py-12 text-center text-sm text-muted-foreground">
            No inventory units yet. Click &quot;Add Unit&quot; to create one.
          </div>
        ) : (
          inventory.map((unit, i) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex((prev) => (prev === i ? null : i))}
              onChange={(u) => updateUnit(i, u)}
              onRemove={() => removeUnit(i)}
              models={models}
            />
          ))
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Inventory"}
        </Button>
      </div>
    </div>
  );
}
