"use client";

import React, { useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import ProjectsTable, { type Project } from "@/components/tables/cms/ProjectsTable";
import ProjectDetailPage from "./ProjectDetailPage";
import { toast } from "sonner";

function ProjectsManager() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${deletingProject.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error ?? "Failed to delete project.");
        return;
      }
      toast.success("Project deleted successfully.");
      setDeletingProject(null);
      setRefreshTrigger((t) => t + 1);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const goToDetail = (project: Project) => {
    setSelectedProjectId(project.id);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBackToList = () => {
    setView("list");
    setSelectedProjectId(null);
    setRefreshTrigger((t) => t + 1);
  };

  const handleAdd = () => {
    setSelectedProjectId("new");
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProjectCreated = (projectId: string) => {
    setSelectedProjectId(projectId);
    setRefreshTrigger((t) => t + 1);
  };

  if (view === "detail" && selectedProjectId) {
    return (
      <ProjectDetailPage
        projectId={selectedProjectId}
        onBack={goBackToList}
        onProjectCreated={handleProjectCreated}
      />
    );
  }

  return (
    <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto m-4 border-border border rounded-xl bg-white">
      <div className="mx-auto p-8 w-full max-w-full min-w-0 overflow-x-hidden">
        <DashboardHeader
          title="Projects Manager"
          description="Manage your projects and their contents."
        />

        <div className="flex flex-col gap-8 animate-in fade-in duration-500 mt-10">
          <ProjectsTable
            onEdit={goToDetail}
            onDelete={(p) => setDeletingProject(p)}
            onAdd={handleAdd}
            refreshTrigger={refreshTrigger}
            onViewProject={goToDetail}
          />
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        itemName={deletingProject?.projectName ?? ""}
        isDeleting={isDeleting}
        title="Delete Project"
        confirmLabel="Delete Project"
        warningMessage="This action cannot be undone and will also remove all associated inventory records."
      />
    </main>
  );
}

export default ProjectsManager;
