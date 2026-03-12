// ProjectDetailsView.tsx — full updated file
"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, Box, LayoutGrid, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import type { Project, InventoryItem, Reservation } from "@/lib/types";

type ProjectDetailsViewProps = {
  project: Project;
  inventory: InventoryItem[];
  reservation: Reservation[];
  onBack: () => void;
};

function ProjectDetailsView({
  project,
  inventory,
  reservation,
  onBack,
}: ProjectDetailsViewProps) {
  const [sortMode, setSortMode] = useState<"block" | "model">("block");
  const [selectedBlock, setSelectedBlock] = useState<string>("all");
  const [selectedLot, setSelectedLot] = useState<InventoryItem | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("all");

  const blocks = useMemo(() => {
    const blockSet = new Set(inventory.map((inv) => inv.block));
    return Array.from(blockSet).sort((a, b) => a - b);
  }, [inventory]);

  const models = useMemo(() => {
    const modelSet = new Set(
      inventory
        .map((inv) => inv.modelName)
        .filter((m): m is string => m != null && m !== ""),
    );
    return Array.from(modelSet).sort((a, b) => a.localeCompare(b));
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    let result = inventory;
    if (selectedBlock !== "all") {
      const blockNum = parseInt(selectedBlock, 10);
      result = result.filter((inv) => inv.block === blockNum);
    }
    if (selectedModel !== "all") {
      result = result.filter((inv) => inv.modelName === selectedModel);
    }
    return result;
  }, [inventory, selectedBlock, selectedModel]);

  // Map: block -> modelName -> InventoryItem[]
  const inventoryByBlock = useMemo(() => {
    const blockMap = new Map<number, Map<string, InventoryItem[]>>();
    for (const inv of filteredInventory) {
      if (!blockMap.has(inv.block)) blockMap.set(inv.block, new Map());
      const modelMap = blockMap.get(inv.block)!;
      const model = inv.modelName ?? "Unknown Model";
      const list = modelMap.get(model) ?? [];
      list.push(inv);
      modelMap.set(model, list);
    }
    for (const modelMap of blockMap.values()) {
      for (const list of modelMap.values()) {
        list.sort((a, b) => a.lot - b.lot);
      }
    }
    return blockMap;
  }, [filteredInventory]);

  // Map: modelName -> block -> InventoryItem[]
  const inventoryByModel = useMemo(() => {
    const modelMap = new Map<string, Map<number, InventoryItem[]>>();
    for (const inv of filteredInventory) {
      const model = inv.modelName ?? "Unknown Model";
      if (!modelMap.has(model)) modelMap.set(model, new Map());
      const blockMap = modelMap.get(model)!;
      const list = blockMap.get(inv.block) ?? [];
      if (list.length === 0) blockMap.set(inv.block, list);
      list.push(inv);
    }
    for (const blockMap of modelMap.values()) {
      for (const list of blockMap.values()) {
        list.sort((a, b) => a.lot - b.lot);
      }
    }
    return modelMap;
  }, [filteredInventory]);

  const handleLotClick = (item: InventoryItem) => {
    setSelectedLot(item);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back + Title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-primary">
            {project.projectName}
          </h2>
          <p className="text-sm text-muted-foreground">Block & lot inventory</p>
        </div>
      </div>

      {/* Legend + Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-slate-50/50 px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Legend
          </span>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-md bg-primary" />
            <span className="text-sm font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-md bg-slate-300" />
            <span className="text-sm font-medium">Sold</span>
          </div>
        </div>

        <section className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              View
            </span>
            <Select
              value={sortMode}
              onValueChange={(v) => setSortMode(v as "block" | "model")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="block" className="gap-2">
                  <LayoutGrid className="size-4" />
                  By Block
                </SelectItem>
                <SelectItem value="model" className="gap-2">
                  <Home className="size-4" />
                  By House Model
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Block
            </span>
            <Select value={selectedBlock} onValueChange={setSelectedBlock}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All blocks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All blocks</SelectItem>
                {blocks.map((b) => (
                  <SelectItem key={b} value={String(b)}>
                    Block {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Model
            </span>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All models</SelectItem>
                {models.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>
      </div>

      {/* Blocks & Lots */}
      {(
        sortMode === "block"
          ? inventoryByBlock.size > 0
          : inventoryByModel.size > 0
      ) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
          {sortMode === "block"
            ? Array.from(inventoryByBlock.entries())
                .sort(([a], [b]) => a - b)
                .map(([block, modelMap]) => (
                  <section key={block} className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
                      Block {block}
                    </h3>
                    {Array.from(modelMap.entries())
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([model, lots]) => (
                        <div key={model} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                              {model}
                            </span>
                            <div className="flex-1 border-t border-dashed border-slate-200" />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {lots.map((item) => renderLotButton(item, model))}
                          </div>
                        </div>
                      ))}
                  </section>
                ))
            : Array.from(inventoryByModel.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([model, blockMap]) => (
                  <section key={model} className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
                      {model}
                    </h3>
                    {Array.from(blockMap.entries())
                      .sort(([a], [b]) => a - b)
                      .map(([block, lots]) => (
                        <div key={block} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                              Block {block}
                            </span>
                            <div className="flex-1 border-t border-dashed border-slate-200" />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {lots.map((item) => renderLotButton(item, model))}
                          </div>
                        </div>
                      ))}
                  </section>
                ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-96">
          <span className="flex flex-col items-center gap-2">
            <Box size={40} className="text-muted-foreground" />
            <p className="text-md text-muted-foreground">No inventory found</p>
          </span>
        </div>
      )}
    </div>
  );

  function renderLotButton(item: InventoryItem, model: string) {
    const isAvailable = item.soldTo == null;
    return (
      <div
        key={item.id}
        className="flex items-center rounded-lg overflow-hidden border border-slate-200/80"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={() => handleLotClick(item)}
              className={`
                flex items-center justify-center w-10 h-10 px-3 font-bold text-lg
                transition-all duration-200 cursor-pointer
                ${
                  isAvailable
                    ? "bg-primary text-primary-foreground hover:brightness-110"
                    : "bg-slate-300 text-slate-600 cursor-default"
                }
              `}
            >
              {item.lot}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px] relative">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="flex flex-col">
                  <span
                    className={`w-full h-2 absolute top-0 left-0 ${isAvailable ? "bg-primary" : "bg-slate-300"}`}
                  />
                  <h1 className="text-lg font-bold text-primary">
                    {item.soldTo ? "SOLD" : "AVAILABLE"}
                  </h1>
                  <p>
                    {project.projectCode} - Block {item.block} Lot {item.lot}
                  </p>
                  <p className="text-xs text-slate-500">{model}</p>
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAvailable ? (
                <>
                  <DropdownMenuItem>Computation</DropdownMenuItem>
                  <DropdownMenuItem>Reserve</DropdownMenuItem>
                  <DropdownMenuItem>Proof of Payment</DropdownMenuItem>
                </>
              ) : (
                <>
                  {item.soldTo != null &&
                    (() => {
                      const res = reservation.find(
                        (r) => String(r.id) === String(item.soldTo),
                      );
                      return res ? (
                        <DropdownMenuLabel className="font-normal">
                          <div className="space-y-1">
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                              Reserved to
                            </p>
                            <p className="text-sm font-semibold text-neutral-950">
                              {res.firstName} {res.lastName}
                            </p>
                            <p className="text-xs text-slate-600">
                              {res.email}
                            </p>
                            <p className="text-xs text-slate-600">
                              {res.phone}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                      ) : (
                        <DropdownMenuItem disabled>
                          <span className="text-sm text-slate-500">
                            Reserved (details unavailable)
                          </span>
                        </DropdownMenuItem>
                      );
                    })()}
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
}

export default ProjectDetailsView;
