"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { qk } from "@/lib/query-keys";
import { fetchAnnouncements } from "@/lib/cms/announcements-fetchers";
import { cmsDashboardQueryOptions } from "@/lib/cms/cms-query-options";
import { invalidateAfterAnnouncementMutation } from "@/lib/cms/cms-invalidation";
import type { Announcement } from "@/lib/cms/cms_types";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import { toast } from "sonner";

export default function AnnouncementsManager({
  onEdit,
}: {
  onEdit: (a: Announcement) => void;
}) {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<Announcement | null>(null);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: qk.announcements(),
    queryFn: fetchAnnouncements,
    ...cmsDashboardQueryOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "Delete failed");
      }
    },
    onSuccess: () => {
      toast.success("Announcement removed.");
      invalidateAfterAnnouncementMutation(queryClient);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const confirmDelete = () => {
    if (!deleting) return;
    const id = deleting.id;
    setDeleting(null);
    deleteMutation.mutate(id);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Manage announcements
      </p>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-background p-4 text-xs text-muted-foreground">
          Loading…
        </div>
      ) : announcements.length === 0 ? (
        <p className="text-xs text-muted-foreground rounded-xl border border-dashed border-border px-3 py-4">
          No announcements yet. Create one to show it on the home ticker.
        </p>
      ) : (
        <ul className="rounded-xl border border-border divide-y divide-border bg-background overflow-hidden">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-2 px-3 py-2.5 hover:bg-muted/30 transition-colors"
            >
              <p className="text-sm font-medium truncate flex-1 min-w-0">{a.headline}</p>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  onClick={() => onEdit(a)}
                  aria-label={`Edit ${a.headline}`}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleting(a)}
                  aria-label={`Delete ${a.headline}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DeleteConfirmModal
        isOpen={deleting != null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        itemName={deleting?.headline ?? "this announcement"}
        title="Delete announcement"
      />
    </div>
  );
}
