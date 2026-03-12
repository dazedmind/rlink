"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, X, CheckSquare } from "lucide-react";

type GalleryToolbarProps = {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  isDeleting: boolean;
};

export function GalleryToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  isDeleting,
}: GalleryToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
        className="gap-1.5"
      >
        <CheckSquare size={14} />
        {selectedCount === totalCount ? "Deselect all" : "Select all"}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDeleteSelected}
        disabled={isDeleting}
        className="gap-1.5"
      >
        <Trash2 size={14} />
        {isDeleting ? "Deleting..." : "Delete selected"}
      </Button>
      <Button variant="ghost" size="sm" onClick={onClearSelection} className="gap-1.5 ml-auto">
        <X size={14} />
        Cancel
      </Button>
    </div>
  );
}
