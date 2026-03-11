"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/FileUpload";
import TextInput from "@/components/ui/TextInput";
import DropSelect from "@/components/ui/DropSelect";
import { FieldLabel } from "@/components/ui/field";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import type { OverviewForm } from "./project-types";
import { Separator } from "@/components/ui/separator";
import { projectStage, projectStatus, projectType  } from "@/lib/types";

const ACCENT_COLORS = [
  { value: "blue", label: "Blue", color: "bg-blue-900/80" },
  { value: "yellow", label: "Yellow", color: "bg-yellow-500/80" },
  { value: "amber", label: "Amber", color: "bg-amber-800/80" },
  { value: "orange", label: "Orange", color: "bg-orange-600/80" },
  { value: "green", label: "Green", color: "bg-green-600/80" },
  { value: "purple", label: "Purple", color: "bg-purple-600/80" },
  { value: "red", label: "Red", color: "bg-red-600/80" },
  { value: "pink", label: "Pink", color: "bg-pink-600/80" },
  { value: "gray", label: "Gray", color: "bg-gray-600/80" },
  { value: "black", label: "Black", color: "bg-gray-800/80" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </Label>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 mt-6 first:mt-0">
      {children}
    </h3>
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
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (!t || values.includes(t)) return;
    onChange([...values, t]);
    setInput("");
  };
  return (
    <div className="flex flex-col gap-1.5">
      <SectionLabel>{label}</SectionLabel>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {values.map((v, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                className="hover:text-red-500"
              >
                ×
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
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          className="h-10 w-full rounded-md border border-border bg-transparent px-4 text-sm outline-none focus-visible:border-ring"
        />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus size={14} />
        </Button>
      </div>
    </div>
  );
}

type ProjectOverviewTabProps = {
  form: OverviewForm;
  setForm: React.Dispatch<React.SetStateAction<OverviewForm>>;
  onSave: () => void;
  isSaving: boolean;
  saveLabel?: string;
};

export default function ProjectOverviewTab({
  form,
  setForm,
  onSave,
  isSaving,
  saveLabel = "Save Changes",
}: ProjectOverviewTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Media - LEFT SIDE */}
        <section className="w-full md:w-1/3">
          <span>
            <h1 className="text-xl font-semibold text-foreground">
              Media & Branding
            </h1>
            <Separator className="my-2" />
          </span>
          <div className="gap-6 mt-4">
            <div className="flex flex-col gap-4">
              {!form.logoUrl ? (
                <FileUpload
                  label="Project Logo"
                  value={form.logoUrl}
                  onChange={(url) => setForm((p) => ({ ...p, logoUrl: url }))}
                />
              ) : (
                <div className="flex flex-col gap-1.5">
                  <FieldLabel className="text-xs uppercase text-gray-500">
                    Project Logo
                  </FieldLabel>
                  <div className="relative w-full h-32 rounded-md overflow-hidden">
                    <Image
                      src={form.logoUrl}
                      alt="Project Logo"
                      fill
                      className="p-4 object-contain"
                    />
                    <Button
                      size="icon"
                      onClick={() => setForm((p) => ({ ...p, logoUrl: "" }))}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      aria-label="Reset Project Logo"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              )}

              <FileUpload
                label="Project Cover Photo"
                value={form.photoUrl}
                onChange={(url) => setForm((p) => ({ ...p, photoUrl: url }))}
              />

              <div className="flex flex-col gap-1.5">
                <SectionLabel>Map Link</SectionLabel>
                <input
                  type="url"
                  value={form.mapLink}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, mapLink: e.target.value }))
                  }
                  placeholder="https://maps.google.com/..."
                  className="h-10 rounded-md border border-border px-3 text-sm w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <SectionLabel>Project Accent Color</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, accentColor: c.value }))
                      }
                      className={`h-8 w-8 rounded-full ${c.color} ${
                        form.accentColor === c.value
                          ? "ring-2 ring-offset-2 ring-primary"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6 w-full md:w-2/3">
          {/* Project identity */}
          <section>
            <span>
              <h1 className="text-xl font-semibold text-foreground">
                Project Identity
              </h1>
              <Separator className="my-2" />
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Project Code *</SectionLabel>
                <TextInput
                  name="projectCode"
                  type="text"
                  placeholder="e.g. AR"
                  value={form.projectCode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, projectCode: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Type *</SectionLabel>
                <DropSelect
                  selectName="type"
                  selectId="type"
                  value={form.type}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, type: e.target.value }))
                  }
                >
                  <option value="">Select type</option>
                  {Object.entries(projectType).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </DropSelect>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-4">
              <SectionLabel>Project Name *</SectionLabel>
              <TextInput
                name="projectName"
                type="text"
                placeholder="e.g. Arcoe Residence"
                value={form.projectName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, projectName: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Status</SectionLabel>
                <DropSelect
                  selectName="status"
                  selectId="status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.value }))
                  }
                >
                  <option value="">Select status</option>
                  {Object.entries(projectStatus).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </DropSelect>
              </div>
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Stage</SectionLabel>
                <DropSelect
                  selectName="stage"
                  selectId="stage"
                  value={form.stage}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, stage: e.target.value }))
                  }
                >
                  <option value="">Select stage</option>
                  {Object.entries(projectStage).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </DropSelect>
              </div>
            </div>
          </section>

          {/* Location & address */}
          <section>
            <span>
              <h1 className="text-xl font-semibold text-foreground">
                Location & Address
              </h1>
              <Separator className="my-2" />
            </span>
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Location</SectionLabel>
                <TextInput
                  name="location"
                  type="text"
                  placeholder="e.g. Cebu City"
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Full Address</SectionLabel>
                <TextInput
                  name="address"
                  type="text"
                  placeholder="Street, barangay, city"
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <SectionLabel>DHSUD Number</SectionLabel>
                  <TextInput
                    name="dhsudNumber"
                    type="text"
                    placeholder="DHSUD permit number"
                    value={form.dhsudNumber}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, dhsudNumber: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <SectionLabel>Completion Date</SectionLabel>
                  <input
                    type="date"
                    value={form.completionDate}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        completionDate: e.target.value,
                      }))
                    }
                    className="h-10 rounded-md border border-border px-3 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Sales Office</SectionLabel>
                <TextInput
                  name="salesOffice"
                  type="text"
                  placeholder="Sales office location"
                  value={form.salesOffice}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, salesOffice: e.target.value }))
                  }
                />
              </div>
            </div>
          </section>

          {/* Content */}
          <section>
            <span>
              <h1 className="text-xl font-semibold text-foreground">Content</h1>
              <Separator className="my-2" />
            </span>
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <SectionLabel>Description</SectionLabel>
                <Textarea
                  value={form.description}
                  placeholder="Brief description of the project..."
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="min-h-24 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TagInput
                  label="Amenities"
                  placeholder="e.g. Swimming Pool, Gym"
                  values={form.amenities}
                  onChange={(v) => setForm((p) => ({ ...p, amenities: v }))}
                />
                <TagInput
                  label="Nearby Landmarks"
                  placeholder="e.g. SM City, Airport"
                  values={form.landmarks}
                  onChange={(v) => setForm((p) => ({ ...p, landmarks: v }))}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
      <span className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving} className="mt-2 w-fit">
          {isSaving ? "Saving..." : saveLabel}
        </Button>
      </span>
    </div>
  );
}
