"use client";

import React, { useState, useCallback } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import UsersTable from "@/components/tables/user-management/UsersTable";
import UserFormModal, {
  type UserRecord,
} from "@/components/modal/user-management/UserFormModal";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import { toast } from "sonner";

function ManageUsers() {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const { authClient } = await import("@/lib/auth-client");
      const { error } = await authClient.admin.removeUser({
        userId: deletingUser.id,
      });
      if (error) {
        toast.error(error.message ?? "Failed to delete user.");
        return;
      }
      await fetch("/api/activity-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity: "User deleted: " + deletingUser.email }),
      }).catch(() => {});
      toast.success("User deleted.");
      setDeletingUser(null);
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
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl h-full bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Manage Users"
          description="Manage your users and their permissions."
        />

        <div className="flex flex-col gap-8 animate-in fade-in duration-500 mt-10">
          <UsersTable
            onEdit={(u) => {
              setEditingUser(u);
              setShowFormModal(true);
            }}
            onDelete={(u) => setDeletingUser(u)}
            onAdd={() => {
              setEditingUser(null);
              setShowFormModal(true);
            }}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      <UserFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingUser(null);
        }}
        onSuccess={handleSuccess}
        user={editingUser}
      />

      <DeleteConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        itemName={deletingUser?.name ?? deletingUser?.email ?? "this user"}
        isDeleting={isDeleting}
        title="Delete User"
        confirmLabel="Delete User"
        warningMessage="This will permanently remove the user and all associated data."
      />
    </main>
  );
}

export default ManageUsers;
