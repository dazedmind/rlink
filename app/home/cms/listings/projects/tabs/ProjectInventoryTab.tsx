"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Star, Info, ArrowUp, ArrowDown } from "lucide-react";
import InventoryUnitFormModal from "@/components/modal/cms/InventoryUnitFormModal";
import type { InventoryUnit, ProjectModel } from "./project-types";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(val);
}

const EMPTY_UNIT: Omit<InventoryUnit, "id"> = {
  modelId: "",
  inventoryCode: "",
  block: 0,
  lot: 0,
  sellingPrice: 0,
  isFeatured: false,
};

type SortField = "block" | "lot" | "sellingPrice" | "inventoryCode" | "model";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "block", label: "Block" },
  { value: "lot", label: "Lot" },
  { value: "sellingPrice", label: "Selling Price" },
  { value: "inventoryCode", label: "Inventory Code" },
  { value: "model", label: "Model" },
];

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>("block");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const editingUnit = editingIndex !== null ? inventory[editingIndex] : null;

  const sortedInventory = useMemo(() => {
    const sorted = [...inventory];
    const getModelName = (u: InventoryUnit) =>
      models.find((m) => m.id === u.modelId)?.modelName ?? "";

    const cmp = (a: InventoryUnit, b: InventoryUnit): number => {
      let diff = 0;
      switch (sortField) {
        case "block":
          diff = a.block - b.block || a.lot - b.lot;
          break;
        case "lot":
          diff = a.lot - b.lot || a.block - b.block;
          break;
        case "sellingPrice":
          diff = a.sellingPrice - b.sellingPrice;
          break;
        case "inventoryCode":
          diff = (a.inventoryCode || "").localeCompare(b.inventoryCode || "");
          break;
        case "model":
          diff = getModelName(a).localeCompare(getModelName(b));
          break;
        default:
          diff = a.block - b.block || a.lot - b.lot;
      }
      return sortDir === "asc" ? diff : -diff;
    };
    sorted.sort(cmp);
    return sorted;
  }, [inventory, models, sortField, sortDir]);

  const openAdd = () => {
    setEditingIndex(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingIndex(null);
  };

  const handleSave = (data: Omit<InventoryUnit, "id">) => {
    if (editingIndex !== null) {
      const existing = inventory[editingIndex];
      setInventory((prev) =>
        prev.map((u, i) =>
          i === editingIndex ? { ...existing, ...data } : u
        )
      );
    } else {
      const newUnit: InventoryUnit = {
        id: crypto.randomUUID(),
        ...EMPTY_UNIT,
        ...data,
      };
      setInventory((prev) => [...prev, newUnit]);
    }
    closeModal();
  };

  const removeUnit = (index: number) => {
    setInventory((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSortDir = () => {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-2xl font-bold">Inventory</h3>
        <div className="flex flex-wrap items-center gap-2">
          {inventory.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="h-9 rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={toggleSortDir}
                aria-label={`Sort ${sortDir === "asc" ? "descending" : "ascending"}`}
              >
                {sortDir === "asc" ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
                )}
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={openAdd}
            disabled={models.length === 0}
            className="gap-2"
          >
            <Plus size={14} />
            Add Unit
          </Button>
        </div>
      </div>

      {models.length === 0 && (
        <div className="flex items-center gap-2 text-amber-800 bg-amber-50/50 border border-amber-100 rounded-lg px-4 py-3 text-sm">
          <Info className="size-4 shrink-0" />
          Define at least one model in the Models tab before adding inventory
          units.
        </div>
      )}

      {inventory.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-12 text-center text-sm text-muted-foreground">
          No inventory units yet. Click &quot;Add Unit&quot; to create one.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-[60px]"></TableHead>
                <TableHead>Inventory Code</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-center">Block</TableHead>
                <TableHead className="text-center">Lot</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInventory.map((unit) => {
                const model = models.find((m) => m.id === unit.modelId);
                const originalIndex = inventory.findIndex((u) => u.id === unit.id);
                return (
                  <TableRow key={unit.id}>
                    <TableCell className="text-center">
                      {unit.isFeatured ? (
                        <Star
                          size={14}
                          className="text-yellow-500 fill-yellow-400 mx-auto"
                        />
                      ) : (
                        <span className="text-muted-foreground"></span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      {unit.inventoryCode || (
                        <span className="text-muted-foreground italic">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {model?.modelName || (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {unit.block || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {unit.lot || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {unit.sellingPrice > 0
                        ? formatCurrency(unit.sellingPrice)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(originalIndex)}
                          aria-label="Edit unit"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeUnit(originalIndex)}
                          aria-label="Remove unit"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <InventoryUnitFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        unit={editingUnit}
        models={models}
      />

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Inventory"}
        </Button>
      </div>
    </div>
  );
}
