"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type DeleteConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  /** @deprecated No longer affects UI — confirm is instant; close the modal in onConfirm before mutating. */
  isDeleting?: boolean;
  title?: string;
  confirmLabel?: string;
  warningMessage?: string;
};

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  title = "Delete",
  confirmLabel = "Delete",
  warningMessage,
}: DeleteConfirmModalProps) {
  const defaultWarning = "This action cannot be undone.";
  const message = warningMessage ?? defaultWarning;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">{itemName}</span>?{" "}
          {message}
        </p>
        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
