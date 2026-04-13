"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Announcement } from "@/lib/cms/cms_types";
import TextInput from "@/components/ui/TextInput";
import TextAreaField from "@/components/ui/TextAreaField";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { toast } from "sonner";
import { invalidateAfterAnnouncementMutation } from "@/lib/cms/cms-invalidation";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";

async function saveAnnouncement(payload: {
  id?: number;
  headline: string;
  body: string;
}) {
  const isEdit = payload.id != null;
  const url = isEdit ? `/api/announcements/${payload.id}` : "/api/announcements";
  const method = isEdit ? "PATCH" : "POST";
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ headline: payload.headline, body: payload.body }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? "Save failed");
  }
  return json;
}

export default function AnnouncementModal({
  isOpen,
  onClose,
  announcement,
}: {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}) {
  const queryClient = useQueryClient();
  const { guard, release } = useSubmitGuard();
  const isEdit = announcement != null;

  const saveMutation = useMutation({
    mutationFn: saveAnnouncement,
    onSuccess: () => {
      toast.success(isEdit ? "Announcement updated." : "Announcement published.");
      invalidateAfterAnnouncementMutation(queryClient);
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const form = useForm({
    defaultValues: {
      headline: "",
      body: "",
    },
    onSubmit: async ({ value }) => {
      const headline = value.headline.trim();
      const body = value.body.trim();
      if (!headline) {
        toast.error("Headline is required.");
        return;
      }
      if (!body) {
        toast.error("Body is required.");
        return;
      }
      if (!guard()) return;
      saveMutation.mutate(
        {
          id: isEdit ? announcement!.id : undefined,
          headline,
          body,
        },
        { onSettled: release }
      );
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    form.reset({
      headline: announcement?.headline ?? "",
      body: announcement?.body ?? "",
    });
  }, [isOpen, announcement?.id, announcement?.headline, announcement?.body, form]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit announcement" : "Create announcement"}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="headline"
            validators={{
              onChange: ({ value }) =>
                value.trim() === "" ? "Headline is required" : undefined,
            }}
          >
            {(field) => (
              <Field>
                <TextInput
                  name="headline"
                  label="Headline"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="text"
                  placeholder="Short title shown on the ticker"
                  validationType="none"
                />
                {field.state.meta.errors.length > 0 && (
                  <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>
                )}
              </Field>
            )}
          </form.Field>

          <form.Field
            name="body"
            validators={{
              onChange: ({ value }) =>
                value.trim() === "" ? "Body is required" : undefined,
            }}
          >
            {(field) => (
              <TextAreaField
                name="body"
                label="Body"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Full message for the announcement tape"
                required
              />
            )}
          </form.Field>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save changes" : "Publish"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
