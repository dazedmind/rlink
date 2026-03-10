"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/FileUpload";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import type { ProjectModel } from "./project-types";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </Label>
  );
}

function InlineInput({
  value,
  placeholder,
  type = "text",
  onChange,
  className = "",
}: {
  value: string | number;
  placeholder: string;
  type?: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value === 0 ? "" : value}
      placeholder={placeholder}
      min={type === "number" ? 0 : undefined}
      onChange={(e) => onChange(e.target.value)}
      className={`h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring placeholder:text-muted-foreground ${className}`}
    />
  );
}

function NumberCell({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <SectionLabel>{label}</SectionLabel>
      <div className="relative">
        <InlineInput
          type="number"
          value={value}
          placeholder="0"
          onChange={(v) => onChange(Number(v))}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

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

function ModelCard({
  model,
  index,
  isOpen,
  onToggle,
  onChange,
  onRemove,
}: {
  model: ProjectModel;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (m: ProjectModel) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof ProjectModel>(
    field: K,
    value: ProjectModel[K]
  ) => onChange({ ...model, [field]: value });

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer select-none hover:bg-slate-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 min-w-0">
          {model.photoUrl ? (
            <Image
              src={model.photoUrl}
              alt=""
              width={36}
              height={36}
              className="rounded-md object-cover border border-border shrink-0"
            />
          ) : (
            <div className="h-9 w-9 rounded-md bg-slate-200 flex items-center justify-center shrink-0">
              <ImageIcon size={14} className="text-slate-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {model.modelName || (
                <span className="text-muted-foreground font-normal italic">
                  Unnamed Model {index + 1}
                </span>
              )}
            </p>
            {!isOpen && (model.floorArea > 0 || model.bathroom > 0) && (
              <p className="text-xs text-muted-foreground">
                {[
                  model.floorArea > 0 && `${model.floorArea} sqm`,
                  model.bathroom > 0 && `${model.bathroom} bath`,
                  model.carport > 0 && `${model.carport} carport`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          {isOpen ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 flex flex-col gap-4 border-t border-border bg-white">
          <section className="flex flex-col md:flex-row gap-4">
            {/* IMAGE */}
            <div className="flex flex-col gap-1.5 w-full md:w-1/3">
              <SectionLabel>Model Photo</SectionLabel>
              <FileUpload
                label=""
                value={model.photoUrl ?? ""}
                onChange={(url) => set("photoUrl", url?.trim() ? url : null)}
                aspect="square"
              />
            </div>

            {/* FORMS */}
            <div className="w-full md:w-2/3 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <SectionLabel>Model Name *</SectionLabel>
                  <InlineInput
                    value={model.modelName}
                    placeholder="e.g. Bungalow Type A"
                    onChange={(v) => set("modelName", v)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <SectionLabel>Lot Class</SectionLabel>
                  <InlineInput
                    value={model.lotClass}
                    placeholder="e.g. Corner, Inner"
                    onChange={(v) => set("lotClass", v)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <SectionLabel>Description</SectionLabel>
                <Textarea
                  value={model.description ?? ""}
                  placeholder="Short description of this unit model..."
                  onChange={(e) => set("description", e.target.value)}
                  className="min-h-[60px] resize-none text-sm"
                />
              </div>

              {/* SPECIFICATIONS */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Unit Specifications
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <NumberCell
                    label="Bathroom"
                    value={model.bathroom}
                    onChange={(n) => set("bathroom", n)}
                  />
                  <NumberCell
                    label="Kitchen"
                    value={model.kitchen}
                    onChange={(n) => set("kitchen", n)}
                  />
                  <NumberCell
                    label="Carport"
                    value={model.carport}
                    onChange={(n) => set("carport", n)}
                  />
                  <NumberCell
                    label="Living Room"
                    value={model.livingRoom}
                    onChange={(n) => set("livingRoom", n)}
                  />
                  <NumberCell
                    label="Service Area"
                    value={model.serviceArea}
                    onChange={(n) => set("serviceArea", n)}
                  />
                  <NumberCell
                    label="Floor Area"
                    value={model.floorArea}
                    onChange={(n) => set("floorArea", n)}
                    suffix="sqm"
                  />
                  <NumberCell
                    label="Lot Area"
                    value={model.lotArea}
                    onChange={(n) => set("lotArea", n)}
                    suffix="sqm"
                  />
                </div>
              </div>
            </div>
           
      
          </section>
         
      

       
        </div>
      )}
    </div>
  );
}

type ProjectModelsTabProps = {
  models: ProjectModel[];
  setModels: React.Dispatch<React.SetStateAction<ProjectModel[]>>;
  onSave: () => void;
  isSaving: boolean;
};

export default function ProjectModelsTab({
  models,
  setModels,
  onSave,
  isSaving,
}: ProjectModelsTabProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const addModel = () => {
    const newId = crypto.randomUUID();
    const newModel: ProjectModel = {
      id: newId,
      ...EMPTY_MODEL,
    };
    setModels((prev) => [...prev, newModel]);
    setOpenIndex(models.length);
  };

  const updateModel = (index: number, updated: ProjectModel) => {
    setModels((prev) =>
      prev.map((m, i) => (i === index ? updated : m))
    );
  };

  const removeModel = (index: number) => {
    setModels((prev) => prev.filter((_, i) => i !== index));
    setOpenIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return prev > 0 ? prev - 1 : 0;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">
          Models
        </h3>
        <Button variant="outline" size="sm" onClick={addModel} className="gap-2">
          <Plus size={14} />
          Add Model
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {models.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl py-12 text-center text-sm text-muted-foreground">
            No models yet. Click &quot;Add Model&quot; to create one.
          </div>
        ) : (
          models.map((model, i) => (
            <ModelCard
              key={model.id}
              model={model}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex((prev) => (prev === i ? null : i))}
              onChange={(m) => updateModel(i, m)}
              onRemove={() => removeModel(i)}
            />
          ))
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Models"}
        </Button>
      </div>
    </div>
  );
}
