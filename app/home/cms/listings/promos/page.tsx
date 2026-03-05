"use client";

import React, { useState, useCallback } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import PromoFormModal, { type Promo } from "@/components/modal/cms/PromoFormModal";
import PromoDetailModal from "@/components/modal/cms/PromoDetailModal";
import PromosTable from "@/components/tables/cms/PromosTable";
import { toast } from "sonner";

function PromosManager() {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [deletingPromo, setDeletingPromo] = useState<Promo | null>(null);
  const [viewingPromo, setViewingPromo] = useState<Promo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDelete = async () => {
    if (!deletingPromo) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/promos/${deletingPromo.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to delete promo.");
        return;
      }
      toast.success("Promo deleted.");
      setDeletingPromo(null);
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
            refreshTrigger={refreshTrigger}
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
        isDeleting={isDeleting}
        title="Delete Promo"
        confirmLabel="Delete Promo"
      />
    </main>
  );
}

export default PromosManager;
