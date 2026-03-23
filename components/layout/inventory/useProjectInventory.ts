"use client";

import { useMemo, useState } from "react";
import type { InventoryItem } from "@/lib/types";

export function useProjectInventory(inventory: InventoryItem[]) {
  const [sortMode, setSortMode] = useState<"block" | "model">("block");
  const [selectedBlock, setSelectedBlock] = useState<string>("all");
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

  const hasInventory =
    sortMode === "block"
      ? inventoryByBlock.size > 0
      : inventoryByModel.size > 0;

  return {
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
  };
}
