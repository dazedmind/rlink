"use client";

import { useState } from "react";
import { Megaphone, CheckCircle2, ThumbsUp, ChevronRight } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Announcement } from "@/lib/cms/cms_types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { invalidateAfterAnnouncementMutation } from "@/lib/cms/cms-invalidation";
import { qk } from "@/lib/query-keys";
import { dateFormatter } from "@/app/utils/dateFormatter";
export default function AnnouncementTicker({
  items,
}: {
  items: Announcement[];
}) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/announcements/${id}/acknowledge`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (json as { error?: string }).error ??
            "Could not record acknowledgment",
        );
      }
      return json as Announcement;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qk.announcements() });
      const previous = queryClient.getQueryData<Announcement[]>(
        qk.announcements(),
      );
      queryClient.setQueryData<Announcement[]>(qk.announcements(), (old) => {
        if (!old) return old;
        return old.map((a) =>
          a.id === id
            ? {
                ...a,
                acknowledgedByMe: true,
                acknowledgeCount: a.acknowledgedByMe
                  ? a.acknowledgeCount
                  : a.acknowledgeCount + 1,
              }
            : a,
        );
      });
      return { previous };
    },
    onError: (err, _id, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(qk.announcements(), context.previous);
      }
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    },
    onSuccess: () => {
      invalidateAfterAnnouncementMutation(queryClient);
    },
  });

  if (items.length === 0) return null;

  const segments = items.map((a) => (
    <span key={a.id} className="inline-flex shrink-0 items-start gap-2 px-2">
      <span className="font-semibold text-primary whitespace-nowrap">
        {a.headline}
      </span>
      <span className="text-smtext-muted-foreground">— {a.body}</span>
    </span>
  ));

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-xl bg-slate-200/50"
        role="region"
        aria-label="Company announcements"
      >
        <div className="flex items-stretch">
          <div className="flex shrink-0 items-center justify-center border-r border-primary/15 bg-slate-300/50 px-3 py-2.5 text-primary">
            <Megaphone className="size-5" aria-hidden />
          </div>
          <div className="relative min-w-0 flex-1 overflow-hidden py-2">
            <div className="announcement-tape-track flex w-max text-sm">
              <div className="flex items-center gap-10 px-4">{segments}</div>
              <div className="flex items-center gap-10 px-4" aria-hidden="true">
                {segments}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-[min(100%,11rem)] items-center justify-end bg-linear-to-r from-transparent via-slate-200 to-slate-200 pl-10 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
              <Button
                size="sm"
                variant="ghost"
                className="pointer-events-auto mr-2 shrink-0 bg-transparent text-primary duration-300 ease-out hover:-translate-y-px hover:text-primary  active:translate-y-0 group/btn hover:bg-transparent"
                onClick={() => setDialogOpen(true)}
              >
                VIEW
                <ChevronRight
                  className="size-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5"
                  aria-hidden
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl gap-0 p-0 sm:max-w-xl">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="text-lg">Announcements</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[min(70vh,28rem)] py-2 px-4">
            <ul className="flex flex-col gap-6 py-4">
              {items.map((a) => {
                const already = a.acknowledgedByMe === true;
                return (
                  <li
                    key={a.id}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <p className="text-sm font-semibold text-primary">
                      {a.headline}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                      {a.body}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span>
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {a.acknowledgeCount}
                          </span>{" "}
                          <ThumbsUp className="size-3.5" aria-hidden />
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Posted on {dateFormatter(a.createdAt)}
                        </p>
                      </span>

                      <span className="flex items-center gap-2">
                        {already ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                            <CheckCircle2 className="size-4" aria-hidden />
                            Acknowledged
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="default"
                            onClick={() => acknowledgeMutation.mutate(a.id)}
                          >
                            I acknowledge
                          </Button>
                        )}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
