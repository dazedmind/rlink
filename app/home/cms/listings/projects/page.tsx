"use client";

import React, { useState, useCallback } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import ProjectFormModal from "@/components/modal/cms/ProjectFormModal";
import ProjectsTable, { type Project } from "@/components/tables/cms/ProjectsTable";
import { toast } from "sonner";

function ProjectsManager() {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
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

  const handleSuccess = useCallback(() => {
    setRefreshTrigger((t) => t + 1);
  }, []);

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Projects Manager"
          description="Manage your projects and their contents."
        />

        <div className="flex flex-col gap-8 animate-in fade-in duration-500 mt-10">
          <ProjectsTable
            onEdit={(p) => {
              setEditingProject(p);
              setShowFormModal(true);
            }}
            onDelete={(p) => setDeletingProject(p)}
            onAdd={() => {
              setEditingProject(null);
              setShowFormModal(true);
            }}
            refreshTrigger={refreshTrigger}
            onViewProject={(p) => {
              setEditingProject(p);
              setShowFormModal(true);
            }}
          />
        </div>
      </div>

      <ProjectFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingProject(null);
        }}
        onSuccess={handleSuccess}
        project={editingProject}
      />

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
