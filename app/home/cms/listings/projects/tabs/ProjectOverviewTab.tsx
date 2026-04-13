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
import { Check, Plus, Trash2 } from "lucide-react";
import type { OverviewForm } from "./project-types";
import { LANDMARK_CATEGORIES, EMPTY_LANDMARKS } from "./project-types";
import { Separator } from "@/components/ui/separator";
import { projectStage, projectStatus, projectType } from "@/lib/types";
import { nameToSlug } from "@/app/utils/nameToSlug";

const ACCENT_COLORS = [
  { value: "blue", label: "Blue", color: "bg-linear-to-r from-blue-500/80 to-blue-900/80" },
  { value: "yellow", label: "Yellow", color: "bg-linear-to-r from-yellow-500/80 to-yellow-900/80" },
  { value: "amber", label: "Amber", color: "bg-linear-to-r from-amber-500/80 to-amber-900/80" },
  { value: "orange", label: "Orange", color: "bg-linear-to-r from-orange-500/80 to-orange-900/80" },
  { value: "green", label: "Green", color: "bg-linear-to-r from-green-500/80 to-green-900/80" },
  { value: "purple", label: "Purple", color: "bg-linear-to-r from-purple-500/80 to-purple-900/80" },
  { value: "red", label: "Red", color: "bg-linear-to-r from-red-500/80 to-red-900/80" },
  { value: "pink", label: "Pink", color: "bg-linear-to-r from-pink-500/80 to-pink-900/80" },
  { value: "gray", label: "Gray", color: "bg-linear-to-r from-gray-500/80 to-gray-900/80" },
  { value: "black", label: "Black", color: "bg-linear-to-r from-gray-500/80 to-gray-900/80" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-semibold text-primary uppercase tracking-wide">
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

function LandmarksByCategoryInput({
  value,
  onChange,
}: {
  value: Record<string, string[]>;
  onChange: (v: Record<string, string[]>) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    LANDMARK_CATEGORIES[0]
  );
  const [input, setInput] = useState("");

  const addToCategory = () => {
    const parts = input
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const existing = value[selectedCategory] ?? [];
    const next = [...existing];
    for (const name of parts) {
      if (!next.includes(name)) next.push(name);
    }
    onChange({ ...value, [selectedCategory]: next });
    setInput("");
  };

  const removeLandmark = (category: string, name: string) => {
    const list = (value[category] ?? []).filter((n) => n !== name);
    onChange({ ...value, [category]: list });
  };

  const allTags: { category: string; name: string }[] = [];
  for (const cat of LANDMARK_CATEGORIES) {
    for (const name of value[cat] ?? []) {
      allTags.push({ category: cat, name });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 w-full">
        <DropSelect
          label="Category"
          selectName="category"
          selectId="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {LANDMARK_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </DropSelect>
      </div>
      <div className="flex flex-col gap-2 w-full">
          <SectionLabel>Locations in {selectedCategory}</SectionLabel>

          <div className="flex flex-col gap-2">
            <span className="flex gap-2">
              <input
                type="text"
                value={input}
                placeholder={
                  selectedCategory === "Hospitals"
                    ? "Cebu Doctors Hospital, Chong Hua"
                    : selectedCategory === "Schools"
                      ? "University of Cebu, USC"
                      : "Add locations..."
                }
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addToCategory())
                }
                className="h-10 flex-1 rounded-md border border-border bg-input/30 px-4 text-sm outline-none focus-visible:border-ring"
              />
              <Button type="button" variant="outline" size="lg" onClick={addToCategory}>
                <Plus size={14} className="mr-1" />
                Add
              </Button>
            </span>

            <p className="text-xs text-muted-foreground pl-2">Add multiple by putting comma</p>
          </div>
        {allTags.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Nearby landmarks ({allTags.length})</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map(({ category, name }) => (
                <span
                  key={`${category}-${name}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                >
                  <span className="font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-xs">{category}</span>
                  {name}
                  <button
                    type="button"
                    onClick={() => removeLandmark(category, name)}
                    className="hover:text-red-500 ml-0.5"
                    aria-label={`Remove ${name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
     
     
    </div>
  );
}

type ProjectOverviewTabProps = {
  form: OverviewForm;
  setForm: React.Dispatch<React.SetStateAction<OverviewForm>>;
  onSave: () => void;
  saveLabel?: string;
};

export default function ProjectOverviewTab({
  form,
  setForm,
  onSave,
  saveLabel = "Save Changes",
}: ProjectOverviewTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row gap-16">
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
                      className={`h-6 w-10 rounded cursor-pointer ${c.color} ${
                        form.accentColor === c.value
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                    >
                      {form.accentColor === c.value && (
                        <span className="flex items-center justify-center text-xs text-primary">
                          <Check className="size-4 stroke-2"/>
                        </span>
                      )}
                    </button>
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
                <TextInput
                  label="Project Code"
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
                <DropSelect
                  label="Type"
                  selectName="type"
                  selectId="type"
                  value={form.type}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, type: e.target.value }))
                  }
                >
                  <option value="" disabled>Select type</option>
                  {Object.entries(projectType).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </DropSelect>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-4">
              <TextInput
                label="Project Name"
                name="projectName"
                type="text"
                placeholder="e.g. Arcoe Residence"
                value={form.projectName}
                onChange={(e) =>
                  setForm((p) => {
                    const next = { ...p, projectName: e.target.value };
                    if (!p.slug) next.slug = nameToSlug(e.target.value);
                    return next;
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5 mt-4">
              <TextInput
                label="Slug"
                name="slug"
                type="text"
                placeholder="e.g. arcoe-residence"
                value={form.slug}
                onChange={(e) =>
                  setForm((p) => ({ ...p, slug: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                URL-friendly identifier. Auto-generated from project name when empty.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <DropSelect
                  label="Status"
                  selectName="status"
                  selectId="status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.value }))
                  }
                >
                  <option value="" disabled>Select status</option>
                  {Object.entries(projectStatus).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </DropSelect>
              </div>
              <div className="flex flex-col gap-1.5">
                <DropSelect
                  label="Stage"
                  selectName="stage"
                  selectId="stage"
                  value={form.stage}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, stage: e.target.value }))
                  }
                >
                  <option value="" disabled>Select stage</option>
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
                <TextInput
                  label="Project Location"
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
                <TextInput
                  label="Project Address"
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
                  <TextInput
                    label="DHSUD Number"
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
                <TextInput
                  label="Sales Office"
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
                  className="min-h-24 resize-none border-border border"
                />
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <SectionLabel>Nearby Landmarks</SectionLabel>
                  <LandmarksByCategoryInput
                    value={form.landmarks}
                    onChange={(v) => setForm((p) => ({ ...p, landmarks: v }))}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <span className="flex justify-end">
        <Button onClick={onSave} className="mt-2 w-fit">
          {saveLabel}
        </Button>
      </span>
    </div>
  );
}
