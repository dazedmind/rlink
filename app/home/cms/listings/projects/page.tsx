"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import DashboardHeader from "@/components/layout/DashboardHeader";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import ProjectsTable from "@/components/tables/cms/ProjectsTable";
import ProjectDetailPage from "./ProjectDetailPage";
import { toast } from "sonner";
import { Project } from "@/lib/types";

function ProjectsManager() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to delete project.");
        }
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.projects() });
      queryClient.invalidateQueries({ queryKey: qk.projectInventory() });
      queryClient.invalidateQueries({ queryKey: qk.cmsDashboard() });
      toast.success("Project deleted successfully.");
      setDeletingProject(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete project.");
    },
  });

  const handleDelete = () => {
    if (!deletingProject) return;
    deleteMutation.mutate(deletingProject.id);
  };

  const goToDetail = (project: Project) => {
    setSelectedProjectId(project.id);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBackToList = () => {
    setView("list");
    setSelectedProjectId(null);
    queryClient.invalidateQueries({ queryKey: qk.projects() });
    queryClient.invalidateQueries({ queryKey: qk.projectInventory() });
  };

  const handleAdd = () => {
    setSelectedProjectId("new");
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProjectCreated = (projectId: string) => {
    setSelectedProjectId(projectId);
    queryClient.invalidateQueries({ queryKey: qk.projects() });
    queryClient.invalidateQueries({ queryKey: qk.projectInventory() });
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
    <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto m-4 border-border border rounded-xl bg-background">
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
            onViewProject={goToDetail}
          />
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        itemName={deletingProject?.projectName ?? ""}
        isDeleting={deleteMutation.isPending}
        title="Delete Project"
        confirmLabel="Delete Project"
        warningMessage="This action cannot be undone and will also remove all associated inventory records."
      />
    </main>
  );
}

export default ProjectsManager;
