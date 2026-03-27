"use client";

import React, { useState } from "react";
import { ArrowLeft, Box, LayoutGrid, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project, InventoryItem, Reservation } from "@/lib/types";
import { useProjectInventory } from "./useProjectInventory";
import { InventoryLotButton } from "./InventoryLotButton";
import { ComputationSheet } from "./ComputationSheet";

type ProjectDetailsViewProps = {
  project: Project;
  inventory: InventoryItem[];
  reservations: Reservation[];
  onBack: () => void;
  onReserve?: (projectName: string, block: number, lot: number) => void;
};

export default function ProjectDetailsView({
  project,
  inventory,
  reservations,
  onBack,
  onReserve,
}: ProjectDetailsViewProps) {
  const [computationItem, setComputationItem] = useState<{
    item: InventoryItem;
    model: string;
  } | null>(null);

  const {
    sortMode,
    setSortMode,
    selectedBlock,
    setSelectedBlock,
    selectedModel,
    setSelectedModel,
    blocks,
    models,
    inventoryByBlock,
    inventoryByModel,
    hasInventory,
  } = useProjectInventory(inventory);

  return (
    <>
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
            <p className="text-sm text-muted-foreground">
              Block & lot inventory
            </p>
          </div>
        </div>

        {/* Legend + Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-accent px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Legend
            </span>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-md bg-primary" />
              <span className="text-sm font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-md bg-muted" />
              <span className="text-sm font-medium">Sold</span>
            </div>
          </div>

          <section className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
        {hasInventory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
            {sortMode === "block"
              ? Array.from(inventoryByBlock.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([block, modelMap]) => (
                    <section key={block} className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Block {block}
                      </h3>
                      {Array.from(modelMap.entries())
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([model, lots]) => (
                          <div key={model} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                {model}
                              </span>
                              <div className="flex-1 border-t border-dashed border-border" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {lots.map((item) => (
                                <InventoryLotButton
                                  key={item.id}
                                  item={item}
                                  model={model}
                                  project={project}
                                  reservations={reservations}
                                  onComputation={(it, m) =>
                                    setComputationItem({ item: it, model: m })
                                  }
                                  onReserve={onReserve}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                    </section>
                  ))
              : Array.from(inventoryByModel.entries())
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([model, blockMap]) => (
                    <section key={model} className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        {model}
                      </h3>
                      {Array.from(blockMap.entries())
                        .sort(([a], [b]) => a - b)
                        .map(([block, lots]) => (
                          <div key={block} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                Block {block}
                              </span>
                              <div className="flex-1 border-t border-dashed border-border" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {lots.map((item) => (
                                <InventoryLotButton
                                  key={item.id}
                                  item={item}
                                  model={model}
                                  project={project}
                                  reservations={reservations}
                                  onComputation={(it, m) =>
                                    setComputationItem({ item: it, model: m })
                                  }
                                  onReserve={onReserve}
                                />
                              ))}
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
              <p className="text-md text-muted-foreground">
                No inventory found
              </p>
            </span>
          </div>
        )}

        <ComputationSheet
          open={computationItem !== null}
          onOpenChange={(open) => !open && setComputationItem(null)}
          item={computationItem?.item ?? null}
          model={computationItem?.model ?? ""}
          project={project}
        />
      </div>
    </>
  );
}
