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
import ModelFormModal from "@/components/modal/cms/ModelFormModal";
import type { ProjectModel } from "./project-types";

const EMPTY_MODEL: Omit<ProjectModel, "id"> = {
  modelName: "",
  description: "",
  bathroom: 0,
  kitchen: 0,
  carport: 0,
  serviceArea: 0,
  livingRoom: 0,
  lotArea: 0,
  floorArea: 0,
  lotClass: "Standard",
  photoUrl: null,
};

type ProjectModelsTabProps = {
  models: ProjectModel[];
  setModels: React.Dispatch<React.SetStateAction<ProjectModel[]>>;
  onSave: () => void;
};

export default function ProjectModelsTab({
  models,
  setModels,
  onSave,
}: ProjectModelsTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const editingModel = editingIndex !== null ? models[editingIndex] : null;

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

  const handleSave = (data: Omit<ProjectModel, "id">) => {
    if (editingIndex !== null) {
      const existing = models[editingIndex];
      setModels((prev) =>
        prev.map((m, i) =>
          i === editingIndex ? { ...existing, ...data } : m
        )
      );
    } else {
      const newModel: ProjectModel = {
        id: crypto.randomUUID(),
        ...EMPTY_MODEL,
        ...data,
      };
      setModels((prev) => [...prev, newModel]);
    }
    closeModal();
  };

  const removeModel = (index: number) => {
    setModels((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Models</h3>
        <Button variant="outline" size="sm" onClick={openAdd} className="gap-2">
          <Plus size={14} />
          Add Model
        </Button>
      </div>

      {models.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-12 text-center text-sm text-muted-foreground">
          No models yet. Click &quot;Add Model&quot; to create one.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Photo</TableHead>
                <TableHead>Model Name</TableHead>
                <TableHead>Lot Class</TableHead>
                <TableHead className="text-right">Floor Area</TableHead>
                <TableHead className="text-right">Lot Area</TableHead>
                <TableHead className="text-center">Bath</TableHead>
                <TableHead className="text-center">Kitchen</TableHead>
                <TableHead className="text-center">Carport</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model, index) => (
                <TableRow key={model.id}>
                  <TableCell className="px-6 py-4">
                    {model.photoUrl ? (
                      <div className="relative aspect-square w-30 rounded-md overflow-hidden bg-muted shrink-0">
                        <Image
                          src={model.photoUrl}
                          alt={model.modelName}
                          width={200}
                          height={200}
                          className="object-cover aspect-square"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center aspect-square w-30 rounded-md overflow-hidden bg-muted shrink-0">
                        <ImageIcon className="size-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {model.modelName || (
                      <span className="text-muted-foreground italic">
                        Unnamed
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{model.lotClass || "—"}</TableCell>
                  <TableCell className="text-right">
                    {model.floorArea > 0 ? `${model.floorArea} sqm` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {model.lotArea > 0 ? `${model.lotArea} sqm` : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {model.bathroom || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {model.kitchen || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {model.carport || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(index)}
                        aria-label={`Edit ${model.modelName || "model"}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeModel(index)}
                        aria-label={`Remove ${model.modelName || "model"}`}
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

      <ModelFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        model={editingModel}
      />

      <div className="flex justify-end">
        <Button onClick={onSave}>Save Models</Button>
      </div>
    </div>
  );
}
