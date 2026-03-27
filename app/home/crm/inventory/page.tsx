"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { crmQueryOptions } from "@/lib/crm/crm-query-options";
import { crmReservationsInventoryFilters } from "@/lib/crm/crm-filters";
import {
  fetchProjectsList,
  fetchProjectInventoryAll,
  fetchReservationsList,
} from "@/lib/crm/crm-fetchers";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Image from "next/image";
import arcoeResidenceLogo from "@/public/project-logo/ar-logo.png";
import arcoeEstatesLogo from "@/public/project-logo/ae-logo.png";
import ProjectDetailsView from "@/app/home/crm/inventory/components/ProjectDetailsView";
import InventorySkeleton from "@/components/layout/skeleton/InventorySkeleton";
import type { Project, InventoryItem, Reservation } from "@/lib/types";

const LOGO_MAP: Record<string, typeof arcoeResidenceLogo> = {
  ar: arcoeResidenceLogo,
  ae: arcoeEstatesLogo,
};

function Inventory({
  setActiveTab,
  onReserveSelect,
}: {
  setActiveTab?: (tab: string) => void;
  onReserveSelect?: (projectName: string, block: number, lot: number) => void;
}) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: qk.projects(),
    queryFn: fetchProjectsList,
    ...crmQueryOptions,
  });

  const { data: inventoryData, isLoading: loadingInventory } = useQuery({
    queryKey: qk.projectInventory(),
    queryFn: fetchProjectInventoryAll,
    ...crmQueryOptions,
  });

  const { data: reservationData, isLoading: loadingReservations } = useQuery({
    queryKey: qk.reservations(crmReservationsInventoryFilters),
    queryFn: () => fetchReservationsList(crmReservationsInventoryFilters),
    ...crmQueryOptions,
  });

  const projects: Project[] = projectsData ?? [];
  const inventory: InventoryItem[] = inventoryData ?? [];
  const reservations: Reservation[] = (reservationData?.data ?? []) as Reservation[];

  const loading = loadingProjects || loadingInventory || loadingReservations;

  const projectInventory = selectedProject
    ? inventory.filter((inv) => String(inv.projectId) === String(selectedProject.id))
    : [];

  const allReservations = reservations;

  const getProjectLogo = (project: Project) => {
    const code = project.projectCode?.toLowerCase().slice(0, 2) ?? "";
    return LOGO_MAP[code] ?? arcoeResidenceLogo;
  };

  if (selectedProject) {
    return (
      <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
        <div className="mx-auto p-8">
          <DashboardHeader
            title="Inventory"
            description="Manage your inventory here."
          />
          <div className="mt-8 animate-fade-in-up">
            <ProjectDetailsView
              project={selectedProject}
              inventory={projectInventory}
              reservations={allReservations}
              onBack={() => setSelectedProject(null)}
              onReserve={
                (projectName, block, lot) => {
                  onReserveSelect?.(projectName, block, lot);
                  setActiveTab?.("reservation");
                }
              }
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Inventory"
          description="Manage your inventory here."
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <InventorySkeleton />
          ) : (
            <div className="contents animate-fade-in-up">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="flex items-center justify-center hover:scale-95 transition-all duration-300 cursor-pointer h-auto aspect-video rounded-xl border bg-card/30 shadow-sm hover:shadow-md "
                >
                  <Image
                    src={project.logoUrl ?? getProjectLogo(project)}
                    alt={project.projectName}
                    width={150}
                    height={150}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Inventory;
