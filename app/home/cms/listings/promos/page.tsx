"use client";

import React, { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import DashboardHeader from "@/components/layout/DashboardHeader";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import PromoFormModal from "@/components/modal/cms/PromoFormModal";
import type { Promo } from "@/lib/types";
import PromoDetailModal from "@/components/modal/cms/PromoDetailModal";
import PromosTable from "@/components/tables/cms/PromosTable";
import { toast } from "sonner";

function PromosManager() {
  const queryClient = useQueryClient();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [deletingPromo, setDeletingPromo] = useState<Promo | null>(null);
  const [viewingPromo, setViewingPromo] = useState<Promo | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/promos/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to delete promo.");
        }
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.promos() });
      toast.success("Promo deleted.");
      setDeletingPromo(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete promo.");
    },
  });

  const handleDelete = () => {
    if (!deletingPromo) return;
    deleteMutation.mutate(deletingPromo.id);
  };

  const handleSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: qk.promos() });
  }, [queryClient]);

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Promos Manager"
          description="Manage your promos and their contents."
        />

        <div className="flex flex-col gap-8 animate-in fade-in duration-500 mt-10">
          <PromosTable
            onEdit={(p) => {
              setEditingPromo(p);
              setShowFormModal(true);
            }}
            onDelete={(p) => setDeletingPromo(p)}
            onView={(p) => setViewingPromo(p)}
            onAdd={() => {
              setEditingPromo(null);
              setShowFormModal(true);
            }}
          />
        </div>
      </div>

      <PromoFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingPromo(null);
        }}
        onSuccess={handleSuccess}
        promo={editingPromo}
      />

      <PromoDetailModal
        promo={viewingPromo}
        isOpen={!!viewingPromo}
        onClose={() => setViewingPromo(null)}
      />

      <DeleteConfirmModal
        isOpen={!!deletingPromo}
        onClose={() => setDeletingPromo(null)}
        onConfirm={handleDelete}
        itemName={deletingPromo?.title ?? ""}
        isDeleting={deleteMutation.isPending}
        title="Delete Promo"
        confirmLabel="Delete Promo"
      />
    </main>
  );
}

export default PromosManager;
