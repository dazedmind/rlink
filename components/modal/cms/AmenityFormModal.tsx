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
import { FileUpload } from "@/components/ui/FileUpload";
import TextInput from "@/components/ui/TextInput";
import type { ProjectAmenity } from "@/app/home/cms/listings/projects/tabs/project-types";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </Label>
  );
}

type AmenityFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amenity: ProjectAmenity) => void;
  amenity?: ProjectAmenity | null;
};

export default function AmenityFormModal({
  isOpen,
  onClose,
  onSave,
  amenity,
}: AmenityFormModalProps) {
  const isEdit = amenity != null;
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (amenity) {
      setName(amenity.name);
      setPhotoUrl(amenity.photoUrl ?? "");
    } else {
      setName("");
      setPhotoUrl("");
    }
  }, [amenity, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      name: trimmed,
      photoUrl: photoUrl.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Amenity" : "Add Amenity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Amenity Name *</FieldLabel>
            <TextInput
              name="amenity-name"
              type="text"
              placeholder="e.g. Swimming Pool, Gym, Clubhouse"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Cover Photo</FieldLabel>
            <FileUpload
              label=""
              value={photoUrl}
              onChange={(url) => setPhotoUrl(url.trim() || "")}
              aspect="rectangle"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {isEdit ? "Save Changes" : "Add Amenity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
