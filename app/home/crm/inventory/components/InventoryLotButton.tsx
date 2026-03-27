"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { InventoryItem, Project, Reservation } from "@/lib/types";

type InventoryLotButtonProps = {
  item: InventoryItem;
  model: string;
  project: Project;
  reservations?: Reservation[];
  onLotClick?: (item: InventoryItem) => void;
  onComputation?: (item: InventoryItem, model: string) => void;
  onReserve?: (projectName: string, block: number, lot: number) => void;
};

export function InventoryLotButton({
  item,
  model,
  project,
  reservations = [],
  onLotClick,
  onComputation,
  onReserve,
}: InventoryLotButtonProps) {
  const isAvailable = item.soldTo == null;

  return (
    <div className="flex items-center rounded-lg overflow-hidden border border-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={() => onLotClick?.(item)}
            className={`
              flex items-center justify-center w-10 h-10 px-3 font-bold text-lg
              transition-all duration-200 cursor-pointer
              ${
                isAvailable
                  ? "bg-primary text-primary-foreground hover:brightness-110"
                  : "bg-muted text-muted-foreground cursor-default"
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
                  className={`w-full h-2 absolute top-0 left-0 ${isAvailable ? "bg-primary" : "bg-muted"}`}
                />
                <h1 className="text-lg font-bold text-primary">
                  {item.soldTo ? "SOLD" : "AVAILABLE"}
                </h1>
                <p>
                  {project.projectCode} - Block {item.block} Lot {item.lot}
                </p>
                <p className="text-xs text-muted-foreground">{model}</p>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAvailable ? (
              <>
                <DropdownMenuItem onClick={() => onComputation?.(item, model)}>
                  Computation
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onReserve?.(project.projectName ?? "", item.block, item.lot)
                  }
                >
                  Reserve
                </DropdownMenuItem>
                <DropdownMenuItem>Proof of Payment</DropdownMenuItem>
              </>
            ) : (
              <>
                {item.soldTo != null && (() => {
                  const res = reservations.find(
                    (r) => String(r.id) === String(item.soldTo ?? ""),
                  );
                  return res ? (
                    <DropdownMenuLabel className="font-normal">
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Reserved to
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {res.firstName} {res.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {res.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {res.phone}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  ) : (
                    <DropdownMenuItem disabled>
                      <span className="text-sm text-muted-foreground">
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
