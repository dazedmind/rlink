"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import ProjectOverviewTab from "./tabs/ProjectOverviewTab";
import ProjectModelsTab from "./tabs/ProjectModelsTab";
import ProjectInventoryTab from "./tabs/ProjectInventoryTab";
import type {
  Project,
  ProjectModel,
  InventoryUnit,
  OverviewForm,
} from "./tabs/project-types";

type Tab = "overview" | "models" | "inventory";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "models", label: "Models" },
  { id: "inventory", label: "Inventory" },
];

function normalizeStringArray(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap((entry) => {
      if (typeof entry === "string") return [entry];
      if (typeof entry === "object" && entry !== null) {
        const obj = entry as Record<string, unknown>;
        if (Array.isArray(obj.items))
          return (obj.items as unknown[]).filter(
            (i): i is string => typeof i === "string"
          );
        const first = Object.values(obj).find((v) => typeof v === "string");
        return first ? [first as string] : [];
      }
      return [];
    });
  }
  return [];
}

type ProjectDetailPageProps = {
  projectId: string;
  onBack: () => void;
};

export default function ProjectDetailPage({
  projectId,
  onBack,
}: ProjectDetailPageProps) {
  const id = projectId;

  const [activeTab, setActiveTabLocal] = useState<Tab>("overview");
  const [project, setProject] = useState<Project | null>(null);
  const [models, setModels] = useState<ProjectModel[]>([]);
  const [inventory, setInventory] = useState<InventoryUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const [form, setForm] = useState<OverviewForm>({
    projectCode: "",
    projectName: "",
    status: "",
    location: "",
    stage: "",
    type: "",
    photoUrl: "",
    logoUrl: "",
    mapLink: "",
    accentColor: "",
    description: "",
    dhsudNumber: "",
    address: "",
    completionDate: "",
    salesOffice: "",
    amenities: [],
    landmarks: [],
  });

  const fetchData = useCallback(async () => {
    if (!id) return;
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
          amenities: normalizeStringArray(proj.amenities),
          landmarks: normalizeStringArray(proj.landmarks),
        });
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
    setSavingSection("overview");
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          projectCode: form.projectCode.trim().toUpperCase(),
          projectName: form.projectName.trim(),
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
          amenities: form.amenities,
          landmarks: form.landmarks,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to save.");
        return;
      }
      toast.success("Project details saved.");
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
      toast.success("Inventory saved.");
      fetchData();
    } catch {
      toast.error("Network error.");
    } finally {
      setSavingSection(null);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 min-w-0 overflow-auto m-4 border-border border rounded-xl bg-white">
        <div className="mx-auto p-8 max-w-full flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex-1 min-w-0 overflow-auto m-4 border-border border rounded-xl bg-white">
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

  return (
    <main className="flex-1 min-w-0 overflow-auto m-4 border-border border rounded-xl bg-white">
      <div className="mx-auto p-8 max-w-full">
        <span className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <DashboardHeader
              title={project.projectName}
              description={`Edit ${project.projectName} details and contents.`}
            />
          </div>
        </span>
        <div className="flex bg-[#F2F2F7] rounded-[10px] p-2 gap-1 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabLocal(tab.id)}
              className={`flex-1 px-2 py-1.5 rounded-[8px] text-sm font-medium transition-all cursor-pointer ${
                currentTab === tab.id
                  ? "bg-primary text-white"
                  : "text-[#8E8E93] hover:text-[#1C1C1E]"
              }`}
            >
              {tab.label}
              {tab.id === "models" && models.length > 0 && ` (${models.length})`}
              {tab.id === "inventory" &&
                inventory.length > 0 &&
                ` (${inventory.length})`}
            </button>
          ))}
        </div>

        {currentTab === "overview" && (
          <ProjectOverviewTab
            form={form}
            setForm={setForm}
            onSave={saveProjectDetails}
            isSaving={savingSection === "overview"}
          />
        )}

        {currentTab === "models" && (
          <ProjectModelsTab
            models={models}
            setModels={setModels}
            onSave={saveModels}
            isSaving={savingSection === "models"}
          />
        )}

        {currentTab === "inventory" && (
          <ProjectInventoryTab
            inventory={inventory}
            setInventory={setInventory}
            models={models}
            onSave={saveInventory}
            isSaving={savingSection === "inventory"}
          />
        )}
      </div>
    </main>
  );
}
