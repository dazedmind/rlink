"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, TextAlignStart, Image, House, Box, Sparkles, Tent } from "lucide-react";
import ProjectOverviewTab from "./tabs/ProjectOverviewTab";
import ProjectAmenitiesTab from "./tabs/ProjectAmenitiesTab";
import ProjectModelsTab from "./tabs/ProjectModelsTab";
import ProjectInventoryTab from "./tabs/ProjectInventoryTab";
import ProjectGalleryTab from "./tabs/ProjectGalleryTab";
import type {
  Project,
  ProjectModel,
  ProjectAmenity,
  InventoryUnit,
  OverviewForm,
} from "./tabs/project-types";
import { LANDMARK_CATEGORIES, EMPTY_LANDMARKS } from "./tabs/project-types";
import BackButton from "@/components/ui/BackButton";
import { nameToSlug } from "@/app/utils/nameToSlug";

type Tab = "overview" | "amenities" | "models" | "inventory" | "gallery";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <TextAlignStart  className="size-5"/> },
  { id: "amenities", label: "Amenities", icon: <Tent  className="size-5"/> },
  { id: "models", label: "Models", icon: <House  className="size-5"/> },
  { id: "inventory", label: "Inventory", icon: <Box  className="size-5"/> },
  { id: "gallery", label: "Gallery", icon: <Image  className="size-5"/> },
];

function normalizeAmenities(raw: unknown): ProjectAmenity[] {
  if (!raw || !Array.isArray(raw)) return [];
  const result: ProjectAmenity[] = [];
  for (const entry of raw) {
    if (typeof entry === "string") {
      if (entry.trim()) result.push({ name: entry.trim() });
    } else if (typeof entry === "object" && entry !== null) {
      const obj = entry as Record<string, unknown>;
      const name = typeof obj.name === "string" ? obj.name.trim() : "";
      if (!name) continue;
      const photoUrl =
        typeof obj.photoUrl === "string" && obj.photoUrl.trim()
          ? obj.photoUrl.trim()
          : undefined;
      result.push(photoUrl ? { name, photoUrl } : { name });
    }
  }
  return result;
}

function normalizeLandmarks(raw: unknown): Record<string, string[]> {
  if (!raw) return { ...EMPTY_LANDMARKS };
  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    const result: Record<string, string[]> = { ...EMPTY_LANDMARKS };
    for (const cat of LANDMARK_CATEGORIES) {
      const val = obj[cat];
      if (Array.isArray(val)) {
        result[cat] = val.filter((i): i is string => typeof i === "string");
      }
    }
    return result;
  }
  if (Array.isArray(raw)) {
    const legacy = raw.filter((i): i is string => typeof i === "string");
    return { ...EMPTY_LANDMARKS, Landmarks: legacy };
  }
  return { ...EMPTY_LANDMARKS };
}

type ProjectDetailPageProps = {
  projectId: string;
  onBack: () => void;
  onProjectCreated?: (projectId: string) => void;
};

const EMPTY_FORM: OverviewForm = {
  projectCode: "",
  projectName: "",
  slug: "",
  status: "",
  location: "",
  stage: "",
  type: "houselot",
  photoUrl: "",
  logoUrl: "",
  mapLink: "",
  accentColor: "",
  description: "",
  dhsudNumber: "",
  address: "",
  completionDate: "",
  salesOffice: "",
  landmarks: { ...EMPTY_LANDMARKS },
};

export default function ProjectDetailPage({
  projectId,
  onBack,
  onProjectCreated,
}: ProjectDetailPageProps) {
  const queryClient = useQueryClient();
  const id = projectId;
  const isCreateMode = id === "new";

  const [activeTab, setActiveTabLocal] = useState<Tab>("overview");
  const [project, setProject] = useState<Project | null>(null);
  const [amenities, setAmenities] = useState<ProjectAmenity[]>([]);
  const [models, setModels] = useState<ProjectModel[]>([]);
  const [inventory, setInventory] = useState<InventoryUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const [form, setForm] = useState<OverviewForm>({
    ...EMPTY_FORM,
  });

  const fetchData = useCallback(async () => {
    if (!id || id === "new") {
      setProject(null);
      setForm(EMPTY_FORM);
      setAmenities([]);
      setModels([]);
      setInventory([]);
      setIsLoading(false);
      return;
    }
    try {
      const [projRes, modelsRes, invRes] = await Promise.all([
        fetch(`/api/projects/${id}`, { credentials: "include" }).then((r) =>
          r.json()
        ),
        fetch(`/api/projects/${id}/models`, { credentials: "include" }).then(
          (r) => r.json()
        ),
        fetch(`/api/projects/${id}/inventory`, { credentials: "include" }).then(
          (r) => r.json()
        ),
      ]);

      const proj = Array.isArray(projRes) ? projRes[0] : projRes;
      if (proj?.id) {
        setProject(proj);
        setForm({
          projectCode: proj.projectCode ?? "",
          projectName: proj.projectName ?? "",
          slug: proj.slug ?? nameToSlug(proj.projectName ?? ""),
          status: proj.status ?? "",
          location: proj.location ?? "",
          stage: proj.stage ?? "",
          type: proj.type ?? "",
          photoUrl: proj.photoUrl ?? "",
          logoUrl: proj.logoUrl ?? "",
          mapLink: proj.mapLink ?? "",
          accentColor: proj.accentColor ?? "",
          description: proj.description ?? "",
          dhsudNumber: proj.dhsudNumber ?? "",
          address: proj.address ?? "",
          completionDate: proj.completionDate
            ? String(proj.completionDate).slice(0, 10)
            : "",
          salesOffice: proj.salesOffice ?? "",
          landmarks: normalizeLandmarks(proj.landmarks),
        });
        setAmenities(normalizeAmenities(proj.amenities));
      } else if (projRes?.error) {
        setProject(null);
      }

      setModels(Array.isArray(modelsRes) ? modelsRes : []);
      setInventory(Array.isArray(invRes) ? invRes : []);
    } catch {
      toast.error("Failed to load project.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveProjectDetails = async () => {
    if (!id) return;
    const payload = {
      projectCode: form.projectCode.trim().toUpperCase(),
      projectName: form.projectName.trim(),
      slug: form.slug.trim() || nameToSlug(form.projectName),
      status: form.status || null,
      location: form.location.trim() || null,
      stage: form.stage || null,
      type: form.type || null,
      photoUrl: form.photoUrl.trim() || null,
      logoUrl: form.logoUrl.trim() || null,
      mapLink: form.mapLink.trim() || null,
      accentColor: form.accentColor.trim() || null,
      description: form.description.trim() || null,
      dhsudNumber: form.dhsudNumber.trim() || null,
      address: form.address.trim() || null,
      completionDate: form.completionDate || null,
      salesOffice: form.salesOffice.trim() || null,
      amenities: amenities,
      landmarks: form.landmarks,
    };
    setSavingSection("overview");
    try {
      if (isCreateMode) {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error ?? "Failed to create project.");
          return;
        }
        const created = await res.json();
        toast.success("Project created.");
        queryClient.invalidateQueries({ queryKey: qk.cmsDashboard() });
        onProjectCreated?.(String(created.id));
      } else {
        const res = await fetch(`/api/projects/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error ?? "Failed to save.");
          return;
        }
        toast.success("Project details saved.");
        fetchData();
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSavingSection(null);
    }
  };

  const saveAmenities = async () => {
    if (!id || id === "new") return;
    setSavingSection("amenities");
    try {
      const res = await fetch(`/api/projects/${id}/amenities`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amenities }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to save amenities.");
        return;
      }
      toast.success("Amenities saved.");
      fetchData();
    } catch {
      toast.error("Network error.");
    } finally {
      setSavingSection(null);
    }
  };

  const saveModels = async () => {
    if (!id) return;
    setSavingSection("models");
    try {
      const payload = models.map((m) => ({
        id: m.id,
        modelName: m.modelName,
        description: m.description,
        bathroom: m.bathroom,
        kitchen: m.kitchen,
        carport: m.carport,
        serviceArea: m.serviceArea,
        livingRoom: m.livingRoom,
        lotArea: m.lotArea,
        floorArea: m.floorArea,
        lotClass: m.lotClass || "Standard",
        photoUrl: m.photoUrl ?? "",
      }));
      const res = await fetch(`/api/projects/${id}/models`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ models: payload }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to save models.");
        return;
      }
      toast.success("Models saved.");
      fetchData();
    } catch {
      toast.error("Network error.");
    } finally {
      setSavingSection(null);
    }
  };

  const saveInventory = async () => {
    if (!id) return;
    setSavingSection("inventory");
    try {
      const payload = inventory
        .filter((u) => u.modelId)
        .map((u) => ({
          modelId: u.modelId,
          inventoryCode: u.inventoryCode,
          block: u.block,
          lot: u.lot,
          sellingPrice: u.sellingPrice,
          isFeatured: u.isFeatured,
        }));
      const res = await fetch(`/api/projects/${id}/inventory`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ units: payload }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to save inventory.");
        return;
      }
      const nextInventory = (await res.json()) as InventoryUnit[];
      if (Array.isArray(nextInventory)) {
        setInventory(nextInventory);
      }
      toast.success("Inventory saved.");
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch {
      toast.error("Network error.");
    } finally {
      setSavingSection(null);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 min-w-0 overflow-auto m-4 border-border border rounded-xl bg-background">
        <div className="mx-auto p-8 max-w-full flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </main>
    );
  }

  if (!project && !isCreateMode) {
    return (
      <main className="flex-1 min-w-0 overflow-auto m-4 border-border border rounded-xl bg-background">
        <div className="mx-auto p-8 max-w-full">
          <p className="text-muted-foreground">Project not found.</p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft size={14} /> Back
          </Button>
        </div>
      </main>
    );
  }

  const currentTab = activeTab;
  const displayTitle = isCreateMode ? "New Project" : (project?.projectName ?? "");
  const displayDescription = isCreateMode
    ? "Fill in the details below to create a new project."
    : `Edit ${project?.projectName} details and contents.`;

  return (
    <main className="flex-1 min-w-0 overflow-auto m-4 border-border border rounded-xl bg-background">
      <div className="mx-auto p-8 max-w-full">
        <span className="flex items-center gap-4 mb-6">
          <BackButton href="/home/cms/listings/projects" mainPageName="Projects" onClick={onBack} />
          <div className="flex-1">
            <DashboardHeader
              title={displayTitle}
              description={displayDescription}
            />
          </div>
        </span>
        {!isCreateMode && (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-start md:justify-start bg-accent rounded-[10px] p-2 gap-1 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabLocal(tab.id)}
                className={`flex-1 w-full md:w-auto min-w-[80px] px-2 py-1.5 rounded-[8px] text-sm font-medium transition-all cursor-pointer ${
                  currentTab === tab.id
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2 justify-center">
                  {tab.icon}{tab.label}
                  {tab.id === "amenities" && amenities.length > 0 && ` (${amenities.length})`}
                  {tab.id === "models" && models.length > 0 && ` (${models.length})`}
                  {tab.id === "inventory" &&
                    inventory.length > 0 &&
                    ` (${inventory.length})`}
                </span>
         
              </button>
            ))}
          </div>
        )}

        {(currentTab === "overview" || isCreateMode) && (
          <ProjectOverviewTab
            form={form}
            setForm={setForm}
            onSave={saveProjectDetails}
            isSaving={savingSection === "overview"}
            saveLabel={isCreateMode ? "Create Project" : "Save"}
          />
        )}

        {!isCreateMode && currentTab === "amenities" && (
          <ProjectAmenitiesTab
            amenities={amenities}
            setAmenities={setAmenities}
            onSave={saveAmenities}
            isSaving={savingSection === "amenities"}
          />
        )}

        {!isCreateMode && currentTab === "models" && (
          <ProjectModelsTab
            models={models}
            setModels={setModels}
            onSave={saveModels}
            isSaving={savingSection === "models"}
          />
        )}

        {!isCreateMode && currentTab === "inventory" && (
          <ProjectInventoryTab
            inventory={inventory}
            setInventory={setInventory}
            models={models}
            onSave={saveInventory}
            isSaving={savingSection === "inventory"}
          />
        )}

        {!isCreateMode && currentTab === "gallery" && (
          <ProjectGalleryTab projectId={id} models={models} />
        )}
      </div>
    </main>
  );
}
