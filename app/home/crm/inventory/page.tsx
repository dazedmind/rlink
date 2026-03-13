"use client";

import React, { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Image from "next/image";
import arcoeResidenceLogo from "@/public/project-logo/ar-logo.png";
import arcoeEstatesLogo from "@/public/project-logo/ae-logo.png";
import ProjectDetailsView from "@/components/layout/inventory/ProjectDetailsView";
import InventorySkeleton from "@/components/layout/skeleton/InventorySkeleton";
import type { Project, InventoryItem, Reservation } from "@/lib/types";

const LOGO_MAP: Record<string, typeof arcoeResidenceLogo> = {
  ar: arcoeResidenceLogo,
  ae: arcoeEstatesLogo,
};

function Inventory() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [reservation, setReservation] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, inventoryRes, reservationRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/projects/inventory"),
          fetch("/api/reservation?limit=1000"),
        ]);
        const projectsData = await projectsRes.json();
        const inventoryData = await inventoryRes.json();
        const reservationData = await reservationRes.json();
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setInventory(Array.isArray(inventoryData) ? inventoryData : []);
        setReservation(Array.isArray(reservationData?.data) ? reservationData.data : []);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const projectInventory = selectedProject
    ? inventory.filter((inv) => String(inv.projectId) === String(selectedProject.id))
    : [];

  // Pass all reservations to resolve soldTo (reservation id) for inventory items
  const allReservations = reservation;

  const getProjectLogo = (project: Project) => {
    const code = project.projectCode?.toLowerCase().slice(0, 2) ?? "";
    return LOGO_MAP[code] ?? arcoeResidenceLogo;
  };

  if (selectedProject) {
    return (
      <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
        <div className="mx-auto p-8">
          <DashboardHeader
            title="Inventory"
            description="Manage your inventory here."
          />
          <div className="mt-8">
            <ProjectDetailsView
              project={selectedProject}
              inventory={projectInventory}
              reservation={allReservations}
              onBack={() => setSelectedProject(null)}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Inventory"
          description="Manage your inventory here."
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <InventorySkeleton />
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedProject(project)}
                className="flex items-center justify-center hover:scale-95 transition-all duration-300 cursor-pointer h-auto aspect-video rounded-xl border bg-white shadow-sm hover:shadow-md hover:border-primary/30"
              >
                <Image
                  src={project.logoUrl ?? getProjectLogo(project)}
                  alt={project.projectName}
                  width={150}
                  height={150}
                />
              </button>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default Inventory;