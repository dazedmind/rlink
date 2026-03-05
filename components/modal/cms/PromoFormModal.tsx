"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TextInput from "@/components/ui/TextInput";
import DropSelect from "@/components/ui/DropSelect";
import { toast } from "sonner";

export type Promo = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  status: string;
  startDate: string;
  endDate: string;
};

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  imageUrl: "",
  linkUrl: "",
  status: "draft",
  startDate: "",
  endDate: "",
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </Label>
  );
}

export default function PromoFormModal({
  isOpen,
  onClose,
  onSuccess,
  promo,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promo?: Promo | null;
}) {
  const isEdit = !!promo;
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (promo) {
      setForm({
        title: promo.title ?? "",
        description: promo.description ?? "",
        imageUrl: promo.imageUrl ?? "",
        linkUrl: promo.linkUrl ?? "",
        status: promo.status ?? "draft",
        startDate: promo.startDate
          ? new Date(promo.startDate).toISOString().slice(0, 16)
          : "",
        endDate: promo.endDate
          ? new Date(promo.endDate).toISOString().slice(0, 16)
          : "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [promo, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/promos/${promo!.id}` : "/api/promos";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
          linkUrl: form.linkUrl.trim() || null,
          status: form.status,
          startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
          endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(
          data.error ?? `Failed to ${isEdit ? "update" : "create"} promo.`
        );
        return;
      }

      toast.success(`Promo ${isEdit ? "updated" : "created"} successfully!`);
      onSuccess();
      onClose();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {isEdit ? "Edit Promo" : "Add Promo"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 pr-0.5 scrollbar-hide flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>
              Title <span className="text-red-500">*</span>
            </FieldLabel>
            <TextInput
              name="title"
              type="text"
              placeholder="Promo title..."
              value={form.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Description</FieldLabel>
            <Textarea
              name="description"
              placeholder="Promo description..."
              value={form.description}
              onChange={handleInputChange}
              className="min-h-20 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Image URL</FieldLabel>
            <TextInput
              name="imageUrl"
              type="url"
              placeholder="https://..."
              value={form.imageUrl}
              onChange={handleInputChange}
            />
            {form.imageUrl && (
              <div className="mt-1 rounded-lg overflow-hidden border border-border h-28 bg-slate-50">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Link URL</FieldLabel>
            <TextInput
              name="linkUrl"
              type="url"
              placeholder="https://..."
              value={form.linkUrl}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Status</FieldLabel>
            <DropSelect
              selectName="status"
              selectId="status"
              value={form.status}
              onChange={(e) => handleSelectChange("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </DropSelect>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Start Date</FieldLabel>
              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleInputChange}
                className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>End Date</FieldLabel>
              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleInputChange}
                className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
                ? "Save Changes"
                : "Add Promo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
