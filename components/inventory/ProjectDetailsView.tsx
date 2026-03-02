"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, Box, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, FileCheck, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";

type Project = { id: string; projectCode: string; projectName: string };
type InventoryItem = {
  id: string;
  projectCode: string;
  inventoryCode: string;
  block: number;
  lot: number;
  soldTo: number | null;
};

type Reservation = {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inventoryCode: string;
  projectName: string;
  block: number;
  lot: number;
};

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
  const [selectedBlock, setSelectedBlock] = useState<string>("all");
  const [selectedLot, setSelectedLot] = useState<InventoryItem | null>(null);

  const blocks = useMemo(() => {
    const blockSet = new Set(inventory.map((inv) => inv.block));
    return Array.from(blockSet).sort((a, b) => a - b);
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    if (selectedBlock === "all") return inventory;
    const blockNum = parseInt(selectedBlock, 10);
    return inventory.filter((inv) => inv.block === blockNum);
  }, [inventory, selectedBlock]);

  const inventoryByBlock = useMemo(() => {
    const map = new Map<number, InventoryItem[]>();
    for (const inv of filteredInventory) {
      const list = map.get(inv.block) ?? [];
      list.push(inv);
      map.set(inv.block, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.lot - b.lot);
    }
    return map;
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
      </div>

      {/* Blocks & Lots */}
      {inventoryByBlock.size > 0 ? (
      <div className="space-y-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 md:gap-6 xl:gap-8">
        {Array.from(inventoryByBlock.entries())
          .sort(([a], [b]) => a - b)
          .map(([block, lots]) => (
            <section key={block}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 mb-3">
                Block {block}
              </h3>
              <div className="flex flex-wrap gap-2">
                {lots.map((item) => {
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
                        <DropdownMenuContent
                          align="start"
                          className="w-[200px] relative"
                        >
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>
                              <span className="flex flex-col">
                                {/* STATUS INDICATOR */}
                                <span
                                  className={`w-full h-2  absolute top-0 left-0 ${isAvailable ? "bg-primary" : "bg-slate-300"}`}
                                ></span>
                                <h1 className="text-lg font-bold text-primary">
                                  {item.soldTo ? "SOLD" : "AVAILABLE"}
                                </h1>
                                <p>
                                  {project.projectCode} - Block {item.block} Lot {item.lot}
                                </p>
                              </span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {isAvailable ? (
                              <>
                                <DropdownMenuItem>Computation</DropdownMenuItem>
                                <DropdownMenuItem>Reserve</DropdownMenuItem>
                                <DropdownMenuItem>
                                  Proof of Payment
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                {item.soldTo != null &&
                                  (() => {
                                    const res = reservation.find(
                                      (r) =>
                                        String(r.id) === String(item.soldTo),
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
                })}
              </div>
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
}

export default ProjectDetailsView;
