"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import Image from "next/image";
import AmenityFormModal from "@/components/modal/cms/AmenityFormModal";
import type { ProjectAmenity } from "./project-types";

type ProjectAmenitiesTabProps = {
  amenities: ProjectAmenity[];
  setAmenities: React.Dispatch<React.SetStateAction<ProjectAmenity[]>>;
  onSave: () => void;
  isSaving: boolean;
};

export default function ProjectAmenitiesTab({
  amenities,
  setAmenities,
  onSave,
  isSaving,
}: ProjectAmenitiesTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const editingAmenity = editingIndex !== null ? amenities[editingIndex] : null;

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

  const handleSave = (amenity: ProjectAmenity) => {
    if (editingIndex !== null) {
      setAmenities((prev) =>
        prev.map((a, i) => (i === editingIndex ? amenity : a))
      );
    } else {
      setAmenities((prev) => [...prev, amenity]);
    }
    closeModal();
  };

  const removeAmenity = (index: number) => {
    setAmenities((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Amenities</h1>
          <Button type="button" variant="outline" size="sm" onClick={openAdd}>
            <Plus className="size-4 mr-2" />
            Add Amenity
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Add project amenities with a name and optional cover photo for each.
        </p>

        {amenities.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              No amenities yet. Add your first amenity to get started.
            </p>
            <Button type="button" variant="outline" onClick={openAdd}>
              <Plus className="size-4 mr-2" />
              Add Amenity
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Amenities</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {amenities.map((amenity, index) => (
                  <TableRow key={index}>
                    <TableCell className="flex items-center gap-4">
                      {amenity.photoUrl ? (
                        <div className="relative w-40 aspect-video rounded-md overflow-hidden bg-muted">
                          <Image
                            src={amenity.photoUrl}
                            alt={amenity.name}
                            className="object-cover"
                            width={160}
                            height={90}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-40 aspect-video rounded-md overflow-hidden bg-muted">
                          <ImageIcon className="size-6 text-muted-foreground/50" />
                        </div>
                      )}

                      <span className="text-lg">
                        {amenity.name || (
                          <span className="text-muted-foreground italic">
                            Untitled
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(index)}
                          aria-label={`Edit ${amenity.name || "amenity"}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeAmenity(index)}
                          aria-label={`Remove ${amenity.name || "amenity"}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AmenityFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        amenity={editingAmenity}
      />

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving} className="w-fit">
          {isSaving ? "Saving..." : "Save Amenities"}
        </Button>
      </div>
    </div>
  );
}
