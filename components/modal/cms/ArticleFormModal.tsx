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
import { articleType } from "@/lib/types";

export type Article = {
  id: number;
  headline: string;
  body: string;
  publishDate: string;
  tags: string[];
  type: "news" | "blog";
  photoUrl: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  headline: string;
  body: string;
  publishDate: string;
  tags: string;
  type: string;
  photoUrl: string;
  isFeatured: boolean;
};

const EMPTY_FORM: FormData = {
  headline: "",
  body: "",
  publishDate: new Date().toISOString().slice(0, 10),
  tags: "",
  type: "news",
  photoUrl: "",
  isFeatured: false,
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </Label>
  );
}

export default function ArticleFormModal({
  isOpen,
  onClose,
  onSuccess,
  article,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  article?: Article | null;
}) {
  const isEdit = !!article;
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (article) {
      setForm({
        headline: article.headline ?? "",
        body: article.body ?? "",
        publishDate: article.publishDate?.toString().slice(0, 10) ?? EMPTY_FORM.publishDate,
        tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
        type: article.type ?? "news",
        photoUrl: article.photoUrl ?? "",
        isFeatured: article.isFeatured ?? false,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [article, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const isCheckbox = (e.target as HTMLInputElement).type === "checkbox";
    setForm((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async () => {
    if (!form.headline.trim()) {
      toast.error("Headline is required.");
      return;
    }
    if (!form.body.trim()) {
      toast.error("Body is required.");
      return;
    }
    if (!form.publishDate) {
      toast.error("Publish date is required.");
      return;
    }

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/articles/${article!.id}` : "/api/articles";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          headline: form.headline.trim(),
          body: form.body.trim(),
          publishDate: form.publishDate,
          tags,
          type: form.type,
          photoUrl: form.photoUrl.trim() || null,
          isFeatured: form.isFeatured,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(
          data.error ?? `Failed to ${isEdit ? "update" : "create"} article.`
        );
        return;
      }

      toast.success(`Article ${isEdit ? "updated" : "created"} successfully!`);
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
            {isEdit ? "Edit Article" : "Add Article"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 pr-0.5 scrollbar-hide flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>
              Headline <span className="text-red-500">*</span>
            </FieldLabel>
            <TextInput
              name="headline"
              type="text"
              placeholder="Article headline..."
              value={form.headline}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>
                Type <span className="text-red-500">*</span>
              </FieldLabel>
              <DropSelect
                selectName="type"
                selectId="type"
                value={form.type}
                onChange={(e) => handleSelectChange("type", e.target.value)}
              >
                {Object.entries(articleType).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </DropSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>
                Publish Date <span className="text-red-500">*</span>
              </FieldLabel>
              <input
                type="date"
                name="publishDate"
                value={form.publishDate}
                onChange={handleInputChange}
                className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Photo URL</FieldLabel>
            <TextInput
              name="photoUrl"
              type="url"
              placeholder="https://..."
              value={form.photoUrl}
              onChange={handleInputChange}
            />
            {form.photoUrl && (
              <div className="mt-1 rounded-lg overflow-hidden border border-border h-28 bg-slate-50">
                <img
                  src={form.photoUrl}
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
            <FieldLabel>
              Body <span className="text-red-500">*</span>
            </FieldLabel>
            <Textarea
              name="body"
              placeholder="Article content..."
              value={form.body}
              onChange={handleInputChange}
              className="min-h-32 resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Tags</FieldLabel>
            <TextInput
              name="tags"
              type="text"
              placeholder="e.g. property, investment, market (comma-separated)"
              value={form.tags}
              onChange={handleInputChange}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm font-medium">Featured article</span>
          </label>
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
                : "Add Article"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
