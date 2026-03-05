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
import TextInput from "@/components/ui/TextInput";
import DropSelect from "@/components/ui/DropSelect";
import { toast } from "sonner";
import {
  Plus,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  Star,
  ImageIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectStatus = "sold" | "available";
type ProjectStage  = "pre_selling" | "ongoing_development" | "completed" | "cancelled";
type ProjectType   = "houselot" | "condo";

type Project = {
  id: string;
  projectCode: string;
  projectName: string;
  status: ProjectStatus | null;
  location: string | null;
  stage: ProjectStage | null;
  type: ProjectType;
  photoUrl: string | null;
  accentColor: string | null;
  description: string | null;
  amenities: unknown;
  landmarks: unknown;
  createdAt: string;
  updatedAt: string;
};

export type ProjectModelForm = {
  modelName: string;
  description: string;
  bathroom: number;
  kitchen: number;
  carport: number;
  serviceArea: number;
  livingRoom: number;
  lotArea: number;
  floorArea: number;
  lotClass: string;
  photoUrl: string;
};

export type InventoryUnitForm = {
  modelIndex: number | null; // index into local models array (resolved to modelId on the API)
  inventoryCode: string;
  block: number;
  lot: number;
  sellingPrice: number;
  isFeatured: boolean;
};

type FormData = {
  projectCode: string;
  projectName: string;
  status: string;
  location: string;
  stage: string;
  type: string;
  photoUrl: string;
  accentColor: string;
  description: string;
  amenities: string[];
  landmarks: string[];
};

const EMPTY_FORM: FormData = {
  projectCode: "",
  projectName: "",
  status: "",
  location: "",
  stage: "",
  type: "",
  photoUrl: "",
  accentColor: "",
  description: "",
  amenities: [],
  landmarks: [],
};

const EMPTY_MODEL: ProjectModelForm = {
  modelName: "",
  description: "",
  bathroom: 0,
  kitchen: 0,
  carport: 0,
  serviceArea: 0,
  livingRoom: 0,
  lotArea: 0,
  floorArea: 0,
  lotClass: "",
  photoUrl: "",
};

const EMPTY_UNIT: InventoryUnitForm = {
  modelIndex: null,
  inventoryCode: "",
  block: 0,
  lot: 0,
  sellingPrice: 0,
  isFeatured: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeStringArray(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap((entry) => {
      if (typeof entry === "string") return [entry];
      if (typeof entry === "object" && entry !== null) {
        const obj = entry as Record<string, unknown>;
        if (Array.isArray(obj.items))
          return (obj.items as unknown[]).filter((i): i is string => typeof i === "string");
        const first = Object.values(obj).find((v) => typeof v === "string");
        return first ? [first as string] : [];
      }
      return [];
    });
  }
  return [];
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(val);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "sold",      label: "Sold Out"  },
];

const STAGE_OPTIONS = [
  { value: "pre_selling",         label: "Pre-Selling"         },
  { value: "ongoing_development", label: "Ongoing Development" },
  { value: "completed",           label: "Completed"           },
  { value: "cancelled",           label: "Cancelled"           },
];

const TYPE_OPTIONS = [
  { value: "houselot", label: "House & Lot"  },
  { value: "condo",    label: "Condominium"  },
];

const ACCENT_COLORS: { value: string; label: string; color: string }[] = [
  { value: "blue",   label: "Blue",   color: "bg-blue-900/60"    },
  { value: "yellow", label: "Yellow", color: "bg-yellow-500/60" },
  { value: "amber",  label: "Amber",  color: "bg-amber-800/60"  },
  { value: "orange", label: "Orange", color: "bg-orange-600/60" },
  { value: "green",  label: "Green",  color: "bg-green-600/60"  },
  { value: "purple", label: "Purple", color: "bg-purple-600/60" },
  { value: "red",    label: "Red",    color: "bg-red-600/60"      },
  { value: "pink",   label: "Pink",   color: "bg-pink-600/60"    },
  { value: "gray",   label: "Gray",   color: "bg-gray-600/60"    },
  { value: "black",  label: "Black",  color: "bg-gray-800/60"       },
];

type Tab = "details" | "media" | "content" | "models" | "inventory";

const TABS: { id: Tab; label: string }[] = [
  { id: "details",   label: "Details"   },
  { id: "media",     label: "Media"     },
  { id: "content",   label: "Content"   },
  { id: "models",    label: "Models"    },
  { id: "inventory", label: "Inventory" },
];

// ─── Shared sub-components ────────────────────────────────────────────────────

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

function TagInput({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (updated: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setInput("");
  };

  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-1.5">
      <SectionLabel>{label}</SectionLabel>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {values.map((v, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              {v}
              <button type="button" onClick={() => remove(i)} className="hover:text-red-500 transition-colors">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          className="h-10 w-full rounded-md border border-border bg-transparent px-4 text-sm outline-none focus-visible:border-ring placeholder:text-muted-foreground"
        />
        <Button type="button" variant="outline" size="sm" onClick={add} className="shrink-0 h-10 px-3">
          <Plus size={14} />
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">Press Enter or click + to add.</p>
    </div>
  );
}

// ─── Model Accordion Card ─────────────────────────────────────────────────────

function ModelCard({
  model,
  index,
  isOpen,
  onToggle,
  onChange,
  onRemove,
}: {
  model: ProjectModelForm;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (m: ProjectModelForm) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof ProjectModelForm>(field: K, value: ProjectModelForm[K]) =>
    onChange({ ...model, [field]: value });

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer select-none hover:bg-slate-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 min-w-0">
          {model.photoUrl ? (
            <img
              src={model.photoUrl}
              alt=""
              className="h-9 w-9 rounded-md object-cover border border-border shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="h-9 w-9 rounded-md bg-slate-200 flex items-center justify-center shrink-0">
              <ImageIcon size={14} className="text-slate-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {model.modelName || <span className="text-muted-foreground font-normal italic">Unnamed Model {index + 1}</span>}
            </p>
            {!isOpen && (model.floorArea > 0 || model.bathroom > 0) && (
              <p className="text-xs text-muted-foreground">
                {[
                  model.floorArea  > 0 && `${model.floorArea} sqm`,
                  model.bathroom   > 0 && `${model.bathroom} bath`,
                  model.carport    > 0 && `${model.carport} carport`,
                ].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          {isOpen
            ? <ChevronUp size={16} className="text-muted-foreground" />
            : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
      </div>

      {/* Expandable body */}
      {isOpen && (
        <div className="p-4 flex flex-col gap-4 border-t border-border bg-white">

          {/* Name + Photo side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <SectionLabel>Model Name <span className="text-red-500">*</span></SectionLabel>
              <InlineInput value={model.modelName} placeholder="e.g. Bungalow Type A" onChange={(v) => set("modelName", v)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <SectionLabel>Lot Class</SectionLabel>
              <InlineInput value={model.lotClass} placeholder="e.g. Corner, Inner" onChange={(v) => set("lotClass", v)} />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Description</SectionLabel>
            <Textarea
              value={model.description}
              placeholder="Short description of this unit model..."
              onChange={(e) => set("description", e.target.value)}
              className="min-h-[60px] resize-none text-sm"
            />
          </div>

          {/* Photo URL */}
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Model Photo URL</SectionLabel>
            <InlineInput type="url" value={model.photoUrl} placeholder="https://example.com/model.jpg" onChange={(v) => set("photoUrl", v)} />
            {model.photoUrl && (
              <div className="mt-1 rounded-lg overflow-hidden border border-border h-28 bg-slate-50">
                <img
                  src={model.photoUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Specs */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Unit Specifications</p>
            <div className="grid grid-cols-3 gap-3">
              <NumberCell label="Bathroom"     value={model.bathroom}    onChange={(n) => set("bathroom",    n)} />
              <NumberCell label="Kitchen"      value={model.kitchen}     onChange={(n) => set("kitchen",     n)} />
              <NumberCell label="Carport"      value={model.carport}     onChange={(n) => set("carport",     n)} />
              <NumberCell label="Living Room"  value={model.livingRoom}  onChange={(n) => set("livingRoom",  n)} />
              <NumberCell label="Service Area" value={model.serviceArea} onChange={(n) => set("serviceArea", n)} />
              <NumberCell label="Floor Area"   value={model.floorArea}   onChange={(n) => set("floorArea",   n)} suffix="sqm" />
              <NumberCell label="Lot Area"     value={model.lotArea}     onChange={(n) => set("lotArea",     n)} suffix="sqm" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Inventory Unit Accordion Card ────────────────────────────────────────────

function UnitCard({
  unit,
  index,
  isOpen,
  onToggle,
  onChange,
  onRemove,
  models,
}: {
  unit: InventoryUnitForm;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (u: InventoryUnitForm) => void;
  onRemove: () => void;
  models: ProjectModelForm[];
}) {
  const set = <K extends keyof InventoryUnitForm>(field: K, value: InventoryUnitForm[K]) =>
    onChange({ ...unit, [field]: value });

  const assignedModel = unit.modelIndex !== null ? models[unit.modelIndex] : null;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer select-none hover:bg-slate-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 min-w-0">
          {unit.isFeatured && <Star size={13} className="text-yellow-500 fill-yellow-400 shrink-0" />}
          <div className="min-w-0">
            <p className="text-sm font-semibold font-mono truncate">
              {unit.inventoryCode || <span className="text-muted-foreground font-sans font-normal italic">Unit {index + 1}</span>}
            </p>
            {!isOpen && (
              <p className="text-xs text-muted-foreground">
                {[
                  assignedModel && assignedModel.modelName,
                  unit.block > 0 && `Blk ${unit.block}`,
                  unit.lot   > 0 && `Lot ${unit.lot}`,
                  unit.sellingPrice > 0 && formatCurrency(unit.sellingPrice),
                ].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          {isOpen
            ? <ChevronUp size={16} className="text-muted-foreground" />
            : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="p-4 flex flex-col gap-4 border-t border-border bg-white">

          {/* Code + Model */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <SectionLabel>Inventory Code <span className="text-red-500">*</span></SectionLabel>
              <InlineInput
                value={unit.inventoryCode}
                placeholder="e.g. AR-B1-L5"
                onChange={(v) => set("inventoryCode", v)}
                className="font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <SectionLabel>House Model <span className="text-red-500">*</span></SectionLabel>
              {models.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 h-10 flex items-center">
                  No models defined yet.
                </p>
              ) : (
                <select
                  value={unit.modelIndex ?? ""}
                  onChange={(e) => set("modelIndex", e.target.value === "" ? null : Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
                >
                  <option value="">Select model</option>
                  {models.map((m, i) => (
                    <option key={i} value={i}>
                      {m.modelName || `Model ${i + 1}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Block + Lot */}
          <div className="grid grid-cols-2 gap-3">
            <NumberCell label="Block" value={unit.block} onChange={(n) => set("block", n)} />
            <NumberCell label="Lot"   value={unit.lot}   onChange={(n) => set("lot",   n)} />
          </div>

          {/* Selling Price */}
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Selling Price (PHP)</SectionLabel>
            <InlineInput
              type="number"
              value={unit.sellingPrice}
              placeholder="0"
              onChange={(v) => set("sellingPrice", Number(v))}
            />
            {unit.sellingPrice > 0 && (
              <p className="text-[11px] text-muted-foreground">{formatCurrency(unit.sellingPrice)}</p>
            )}
          </div>

          {/* Featured toggle */}
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div
              role="switch"
              aria-checked={unit.isFeatured}
              onClick={() => set("isFeatured", !unit.isFeatured)}
              className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${unit.isFeatured ? "bg-primary" : "bg-slate-200"}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${unit.isFeatured ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm font-medium select-none">Featured unit</span>
            {unit.isFeatured && <Star size={13} className="text-yellow-500 fill-yellow-400" />}
          </label>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSuccess,
  project,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: Project | null;
}) {
  const isEdit = !!project;

  const [activeTab,     setActiveTab]     = useState<Tab>("details");
  const [form,          setForm]          = useState<FormData>(EMPTY_FORM);
  const [models,        setModels]        = useState<ProjectModelForm[]>([]);
  const [units,         setUnits]         = useState<InventoryUnitForm[]>([]);
  const [openModelIdx,  setOpenModelIdx]  = useState<number | null>(null);
  const [openUnitIdx,   setOpenUnitIdx]   = useState<number | null>(null);
  const [isSubmitting,  setIsSubmitting]  = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        projectCode:  project.projectCode  ?? "",
        projectName:  project.projectName  ?? "",
        status:       project.status       ?? "",
        location:     project.location     ?? "",
        stage:        project.stage        ?? "",
        type:         project.type         ?? "",
        photoUrl:     project.photoUrl     ?? "",
        accentColor:  project.accentColor  ?? "",
        description:  project.description  ?? "",
        amenities:    normalizeStringArray(project.amenities),
        landmarks:    normalizeStringArray(project.landmarks),
      });
      const fetchModelsAndUnits = async () => {
        try {
          const [modelsRes, inventoryRes] = await Promise.all([
            fetch(`/api/projects/${project.id}/models`),
            fetch(`/api/projects/${project.id}/inventory`),
          ]);
          const modelsData = await modelsRes.json();
          const inventoryData = await inventoryRes.json();
          const loadedModels: ProjectModelForm[] = Array.isArray(modelsData)
            ? modelsData.map((m: Record<string, unknown>) => ({
                modelName:    String(m.modelName ?? ""),
                description: String(m.description ?? ""),
                bathroom:    Number(m.bathroom ?? 0),
                kitchen:     Number(m.kitchen ?? 0),
                carport:     Number(m.carport ?? 0),
                serviceArea: Number(m.serviceArea ?? 0),
                livingRoom:  Number(m.livingRoom ?? 0),
                lotArea:     Number(m.lotArea ?? 0),
                floorArea:   Number(m.floorArea ?? 0),
                lotClass:    String(m.lotClass ?? ""),
                photoUrl:    String(m.photoUrl ?? ""),
              }))
            : [];
          const modelIds = Array.isArray(modelsData)
            ? modelsData.map((m: Record<string, unknown>) => m.id)
            : [];
          const loadedUnits: InventoryUnitForm[] = Array.isArray(inventoryData)
            ? inventoryData.map((inv: Record<string, unknown>) => {
                const modelId = inv.modelId as string | undefined;
                const idx = modelId ? modelIds.indexOf(modelId) : -1;
                return {
                  modelIndex:   idx >= 0 ? idx : null,
                  inventoryCode: String(inv.inventoryCode ?? ""),
                  block:        Number(inv.block ?? 0),
                  lot:          Number(inv.lot ?? 0),
                  sellingPrice: Number(inv.sellingPrice ?? 0),
                  isFeatured:   Boolean(inv.isFeatured),
                };
              })
            : [];
          setModels(loadedModels);
          setUnits(loadedUnits);
        } catch {
          setModels([]);
          setUnits([]);
        }
      };
      fetchModelsAndUnits();
    } else {
      setForm(EMPTY_FORM);
      setModels([]);
      setUnits([]);
    }
    setActiveTab("details");
    setOpenModelIdx(null);
    setOpenUnitIdx(null);
  }, [project, isOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  // Models CRUD
  const addModel = () => {
    setModels((prev) => [...prev, { ...EMPTY_MODEL }]);
    setOpenModelIdx(models.length);
  };
  const updateModel = (i: number, m: ProjectModelForm) =>
    setModels((prev) => prev.map((x, idx) => (idx === i ? m : x)));
  const removeModel = (i: number) => {
    setModels((prev) => prev.filter((_, idx) => idx !== i));
    // Re-index unit modelIndexes after removal
    setUnits((prev) => prev.map((u) => {
      if (u.modelIndex === null) return u;
      if (u.modelIndex === i)    return { ...u, modelIndex: null };
      if (u.modelIndex > i)      return { ...u, modelIndex: u.modelIndex - 1 };
      return u;
    }));
    setOpenModelIdx(null);
  };

  // Units CRUD
  const addUnit = () => {
    setUnits((prev) => [...prev, { ...EMPTY_UNIT }]);
    setOpenUnitIdx(units.length);
  };
  const updateUnit = (i: number, u: InventoryUnitForm) =>
    setUnits((prev) => prev.map((x, idx) => (idx === i ? u : x)));
  const removeUnit = (i: number) => {
    setUnits((prev) => prev.filter((_, idx) => idx !== i));
    setOpenUnitIdx(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.projectName.trim()) { toast.error("Project name is required.");  setActiveTab("details"); return; }
    if (!form.projectCode.trim()) { toast.error("Project code is required.");  setActiveTab("details"); return; }
    if (!form.type)               { toast.error("Project type is required.");  setActiveTab("details"); return; }

    for (let i = 0; i < models.length; i++) {
      if (!models[i].modelName.trim()) {
        toast.error(`Model ${i + 1} is missing a name.`);
        setActiveTab("models"); setOpenModelIdx(i); return;
      }
    }
    for (let i = 0; i < units.length; i++) {
      if (!units[i].inventoryCode.trim()) {
        toast.error(`Unit ${i + 1} is missing an inventory code.`);
        setActiveTab("inventory"); setOpenUnitIdx(i); return;
      }
      if (units[i].modelIndex === null) {
        toast.error(`Unit ${i + 1} has no model assigned.`);
        setActiveTab("inventory"); setOpenUnitIdx(i); return;
      }
    }

    setIsSubmitting(true);
    try {
      const url    = isEdit ? `/api/projects/${project!.id}` : "/api/projects";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          projectCode:  form.projectCode.trim().toUpperCase(),
          projectName:  form.projectName.trim(),
          status:       form.status      || null,
          location:     form.location.trim() || null,
          stage:        form.stage       || null,
          type:         form.type,
          photoUrl:     form.photoUrl.trim()    || null,
          accentColor:  form.accentColor.trim() || null,
          description:  form.description.trim() || null,
          amenities:    form.amenities,
          landmarks:    form.landmarks,
          models,
          units,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? `Failed to ${isEdit ? "update" : "create"} project.`);
        return;
      }

      toast.success(`Project ${isEdit ? "updated" : "created"} successfully!`);
      onSuccess();
      onClose();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>{isEdit ? "Edit Project" : "Add New Project"}</DialogTitle>
        </DialogHeader>

        {/* ── Tab Bar ──────────────────────────────────── */}
        <div className="flex bg-[#F2F2F7] rounded-[10px] p-1 gap-1 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 py-1.5 rounded-[8px] text-[12px] font-medium transition-all duration-150 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-[0_1px_3px_rgba(0,0,0,0.10)]"
                  : "text-[#8E8E93] hover:text-[#1C1C1E]"
              }`}
            >
              {tab.label}
              {tab.id === "models"    && models.length > 0 && (
                <span className="ml-1 text-[10px] opacity-70">({models.length})</span>
              )}
              {tab.id === "inventory" && units.length > 0 && (
                <span className="ml-1 text-[10px] opacity-70">({units.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ───────────────────────────── */}
        <div className="flex-1 overflow-y-auto py-2 pr-0.5 scrollbar-hide">

          {/* ─── Details ─────────────────────────────── */}
          {activeTab === "details" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <SectionLabel>Project Code <span className="text-red-500">*</span></SectionLabel>
                  <TextInput name="projectCode" type="text" placeholder="e.g. AR" value={form.projectCode} onChange={handleInputChange} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <SectionLabel>Type <span className="text-red-500">*</span></SectionLabel>
                  <DropSelect selectName="type" selectId="type" onChange={(e) => handleSelectChange("type", e.target.value)} value={form.type}>
                    <option value="">Select type</option>
                    {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </DropSelect>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Project Name <span className="text-red-500">*</span></SectionLabel>
                <TextInput name="projectName" type="text" placeholder="e.g. Arcoe Residence" value={form.projectName} onChange={handleInputChange} />
              </div>
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Location</SectionLabel>
                <TextInput name="location" type="text" placeholder="e.g. Cebu City, Philippines" value={form.location} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <SectionLabel>Status</SectionLabel>
                  <DropSelect selectName="status" selectId="status" onChange={(e) => handleSelectChange("status", e.target.value)} value={form.status}>
                    <option value="">Select status</option>
                    {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </DropSelect>
                </div>
                <div className="flex flex-col gap-1.5">
                  <SectionLabel>Stage</SectionLabel>
                  <DropSelect selectName="stage" selectId="stage" onChange={(e) => handleSelectChange("stage", e.target.value)} value={form.stage}>
                    <option value="">Select stage</option>
                    {STAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </DropSelect>
                </div>
              </div>
            </div>
          )}

          {/* ─── Media ───────────────────────────────── */}
          {activeTab === "media" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Project Cover Photo URL</SectionLabel>
                <TextInput name="photoUrl" type="url" placeholder="https://example.com/cover.jpg" value={form.photoUrl} onChange={handleInputChange} />
                {form.photoUrl && (
                  <div className="mt-1 rounded-lg overflow-hidden border border-border h-36 bg-slate-50">
                    <img src={form.photoUrl} alt="Cover preview" className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <SectionLabel>Accent Color</SectionLabel>
                <div className="flex gap-2">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => handleSelectChange("accentColor", c.value)}
                      className={`relative h-10 w-10 rounded-full transition-all ${c.color} ${
                        form.accentColor === c.value
                          ? "border-ring shadow-md"
                          : "border-transparent hover:border-border hover:scale-105"
                      }`}
                    >
                      {form.accentColor === c.value && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7l3.5 3.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {form.accentColor && (
                  <p className="text-sm text-muted-foreground capitalize">
                    Selected: <span className="font-medium text-foreground">{form.accentColor}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ─── Content ─────────────────────────────── */}
          {activeTab === "content" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Description</SectionLabel>
                <Textarea name="description" placeholder="Brief description shown on the website..." value={form.description} onChange={handleInputChange} className="min-h-24 resize-none" />
              </div>
              <TagInput label="Amenities" placeholder="e.g. Swimming Pool, Gym" values={form.amenities} onChange={(v) => setForm((p) => ({ ...p, amenities: v }))} />
              <TagInput label="Nearby Landmarks" placeholder="e.g. SM City, Airport" values={form.landmarks} onChange={(v) => setForm((p) => ({ ...p, landmarks: v }))} />
            </div>
          )}

          {/* ─── Models ──────────────────────────────── */}
          {activeTab === "models" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">House Models</p>
                  <p className="text-xs text-muted-foreground">Define unit types, specs, and model photos.</p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addModel} className="gap-1.5">
                  <Plus size={13} /> Add Model
                </Button>
              </div>

              {models.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl gap-2 text-center">
                  <ImageIcon size={30} className="text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No models yet.</p>
                  <Button type="button" size="sm" variant="outline" onClick={addModel} className="gap-1.5 mt-1">
                    <Plus size={13} /> Add First Model
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {models.map((m, i) => (
                    <ModelCard
                      key={i}
                      model={m}
                      index={i}
                      isOpen={openModelIdx === i}
                      onToggle={() => setOpenModelIdx(openModelIdx === i ? null : i)}
                      onChange={(updated) => updateModel(i, updated)}
                      onRemove={() => removeModel(i)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── Inventory ───────────────────────────── */}
          {activeTab === "inventory" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Inventory Units</p>
                  <p className="text-xs text-muted-foreground">Add individual lots with block, lot number, and pricing.</p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addUnit} className="gap-1.5">
                  <Plus size={13} /> Add Unit
                </Button>
              </div>

              {models.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                  <span>⚠</span>
                  <span>Define house models first before adding inventory units.</span>
                  <button type="button" className="underline font-semibold ml-auto shrink-0" onClick={() => setActiveTab("models")}>
                    Go to Models →
                  </button>
                </div>
              )}

              {units.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl gap-2 text-center">
                  <p className="text-sm text-muted-foreground">No units added yet.</p>
                  <Button type="button" size="sm" variant="outline" onClick={addUnit} className="gap-1.5 mt-1">
                    <Plus size={13} /> Add First Unit
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    {units.map((u, i) => (
                      <UnitCard
                        key={i}
                        unit={u}
                        index={i}
                        isOpen={openUnitIdx === i}
                        onToggle={() => setOpenUnitIdx(openUnitIdx === i ? null : i)}
                        onChange={(updated) => updateUnit(i, updated)}
                        onRemove={() => removeUnit(i)}
                        models={models}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-right pt-1">
                    {units.length} unit{units.length !== 1 ? "s" : ""} ·{" "}
                    {units.filter((u) => u.isFeatured).length} featured
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────── */}
        <DialogFooter className="shrink-0 pt-3 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save Changes" : "Add Project")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}