"use client";

import React, { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import DashboardHeader from "@/components/layout/DashboardHeader";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import CareerFormModal from "@/components/modal/cms/CareerFormModal";
import CareerDetailModal from "@/components/modal/cms/CareerDetailModal";
import CareersTable from "@/components/tables/cms/CareersTable";
import { Career } from "@/lib/types";
import { toast } from "sonner";

function CareersManager() {
  const queryClient = useQueryClient();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [deletingCareer, setDeletingCareer] = useState<Career | null>(null);
  const [viewingCareer, setViewingCareer] = useState<Career | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/careers/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to delete posting.");
        }
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.careers() });
      toast.success("Job posting deleted.");
      setDeletingCareer(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete posting.");
    },
  });

  const handleDelete = () => {
    if (!deletingCareer) return;
    deleteMutation.mutate(deletingCareer.id);
  };

  const handleSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: qk.careers() });
  }, [queryClient]);

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
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
        isDeleting={deleteMutation.isPending}
        title="Delete Job Posting"
        confirmLabel="Delete Posting"
      />
    </main>
  );
}

export default CareersManager;
