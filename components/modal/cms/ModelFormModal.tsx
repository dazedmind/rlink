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
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/FileUpload";
import type { ProjectModel } from "@/app/home/cms/listings/projects/tabs/project-types";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </Label>
  );
}

type ModelFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (model: Omit<ProjectModel, "id">) => void;
  model?: ProjectModel | null;
};

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

export default function ModelFormModal({
  isOpen,
  onClose,
  onSave,
  model,
}: ModelFormModalProps) {
  const isEdit = model != null;
  const [modelName, setModelName] = useState("");
  const [description, setDescription] = useState("");
  const [lotClass, setLotClass] = useState("Standard");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [bathroom, setBathroom] = useState(0);
  const [kitchen, setKitchen] = useState(0);
  const [carport, setCarport] = useState(0);
  const [serviceArea, setServiceArea] = useState(0);
  const [livingRoom, setLivingRoom] = useState(0);
  const [lotArea, setLotArea] = useState(0);
  const [floorArea, setFloorArea] = useState(0);

  useEffect(() => {
    if (model) {
      setModelName(model.modelName);
      setDescription(model.description ?? "");
      setLotClass(model.lotClass || "Standard");
      setPhotoUrl(model.photoUrl);
      setBathroom(model.bathroom);
      setKitchen(model.kitchen);
      setCarport(model.carport);
      setServiceArea(model.serviceArea);
      setLivingRoom(model.livingRoom);
      setLotArea(model.lotArea);
      setFloorArea(model.floorArea);
    } else {
      setModelName("");
      setDescription("");
      setLotClass("Standard");
      setPhotoUrl(null);
      setBathroom(0);
      setKitchen(0);
      setCarport(0);
      setServiceArea(0);
      setLivingRoom(0);
      setLotArea(0);
      setFloorArea(0);
    }
  }, [model, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName.trim()) return;
    onSave({
      modelName: modelName.trim(),
      description: description.trim() || null,
      lotClass: lotClass.trim() || "Standard",
      photoUrl: photoUrl?.trim() || null,
      bathroom,
      kitchen,
      carport,
      serviceArea,
      livingRoom,
      lotArea,
      floorArea,
    });
    onClose();
  };

  const numInput = (
    label: string,
    value: number,
    onChange: (n: number) => void,
    suffix?: string
  ) => (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          type="number"
          value={value || ""}
          placeholder="0"
          min={0}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring pr-8"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Model" : "Add Model"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Model Photo</FieldLabel>
              <FileUpload
                label=""
                value={photoUrl ?? ""}
                onChange={(url) => setPhotoUrl(url?.trim() ? url : null)}
                aspect="square"
              />
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Model Name *</FieldLabel>
                  <input
                    type="text"
                    value={modelName}
                    placeholder="e.g. Bungalow Type A"
                    onChange={(e) => setModelName(e.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Lot Class</FieldLabel>
                  <input
                    type="text"
                    value={lotClass}
                    placeholder="e.g. Corner, Inner"
                    onChange={(e) => setLotClass(e.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  value={description}
                  placeholder="Short description of this unit model..."
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[60px] resize-none text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Unit Specifications
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {numInput("Bathroom", bathroom, setBathroom)}
              {numInput("Kitchen", kitchen, setKitchen)}
              {numInput("Carport", carport, setCarport)}
              {numInput("Living Room", livingRoom, setLivingRoom)}
              {numInput("Service Area", serviceArea, setServiceArea)}
              {numInput("Floor Area", floorArea, setFloorArea, "sqm")}
              {numInput("Lot Area", lotArea, setLotArea, "sqm")}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!modelName.trim()}>
              {isEdit ? "Save Changes" : "Add Model"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
