"use client";

import React, { useState, useCallback } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import CareerFormModal from "@/components/modal/cms/CareerFormModal";
import CareerDetailModal from "@/components/modal/cms/CareerDetailModal";
import CareersTable from "@/components/tables/cms/CareersTable";
import { Career } from "@/lib/types";
import { toast } from "sonner";

function CareersManager() {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [deletingCareer, setDeletingCareer] = useState<Career | null>(null);
  const [viewingCareer, setViewingCareer] = useState<Career | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDelete = async () => {
    if (!deletingCareer) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/careers/${deletingCareer.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to delete posting.");
        return;
      }
      toast.success("Job posting deleted.");
      setDeletingCareer(null);
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
          title="Careers Manager"
          description="Manage your job postings and their contents."
        />

        <div className="flex flex-col gap-8 animate-in fade-in duration-500 mt-10">
          <CareersTable
            onEdit={(c) => {
              setEditingCareer(c);
              setShowFormModal(true);
            }}
            onDelete={(c) => setDeletingCareer(c)}
            onView={(c) => setViewingCareer(c)}
            onAdd={() => {
              setEditingCareer(null);
              setShowFormModal(true);
            }}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      <CareerFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingCareer(null);
        }}
        onSuccess={handleSuccess}
        career={editingCareer}
      />

      <CareerDetailModal
        career={viewingCareer}
        isOpen={!!viewingCareer}
        onClose={() => setViewingCareer(null)}
      />

      <DeleteConfirmModal
        isOpen={!!deletingCareer}
        onClose={() => setDeletingCareer(null)}
        onConfirm={handleDelete}
        itemName={deletingCareer?.position ?? ""}
        isDeleting={isDeleting}
        title="Delete Job Posting"
        confirmLabel="Delete Posting"
      />
    </main>
  );
}

export default CareersManager;
