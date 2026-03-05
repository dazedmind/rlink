"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Star, Plus, X } from "lucide-react";
import TextInput from "@/components/ui/TextInput";
import DropSelect from "@/components/ui/DropSelect";
import { marked } from "marked";

import type { Article } from "@/components/tables/cms/NewsTable";

// ─── TagInput (same pattern as ProjectFormModal) ─────────────────────────────────

function TagInput({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (updated: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setInput("");
  };

  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {values.map((v, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(i)}
                className="hover:text-red-500 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className="h-10 w-full rounded-md border border-border bg-transparent px-4 text-sm outline-none focus-visible:border-ring placeholder:text-muted-foreground"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          className="shrink-0 h-10 px-3"
        >
          <Plus size={14} />
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Press Enter or click + to add.
      </p>
    </div>
  );
}

const TYPE_OPTIONS = [
  { value: "news", label: "News" },
  { value: "blog", label: "Blog" },
];

export default function ArticleEditor({
  article,
  onSave,
  onCancel,
}: {
  article: Article | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!article;
  const containerRef = useRef<HTMLDivElement>(null);

  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [publishDate, setPublishDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [tags, setTags] = useState<string[]>([]);
  const [type, setType] = useState<"news" | "blog">("news");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mdTab, setMdTab] = useState<"write" | "preview">("write");

  useEffect(() => {
    if (article) {
      setHeadline(article.headline ?? "");
      setBody(article.body ?? "");
      setPublishDate(
        article.publishDate?.toString().slice(0, 10) ??
          new Date().toISOString().slice(0, 10),
      );
      setTags(Array.isArray(article.tags) ? article.tags : []);
      setType(article.type ?? "news");
      setPhotoUrl(article.photoUrl ?? "");
      setIsFeatured(article.isFeatured ?? false);
    } else {
      setHeadline("");
      setBody("");
      setPublishDate(new Date().toISOString().slice(0, 10));
      setTags([]);
      setType("news");
      setPhotoUrl("");
      setIsFeatured(false);
    }
  }, [article]);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;

  const handleSubmit = async () => {
    if (!headline.trim()) {
      toast.error("Headline is required.");
      return;
    }
    if (!body.trim()) {
      toast.error("Body is required.");
      return;
    }
    if (!publishDate) {
      toast.error("Publish date is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/articles/${article!.id}` : "/api/articles";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          headline: headline.trim(),
          body: body.trim(),
          publishDate,
          tags,
          type,
          photoUrl: photoUrl.trim() || null,
          isFeatured,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(
          data.error ?? `Failed to ${isEdit ? "update" : "create"} article.`,
        );
        return;
      }

      toast.success(`Article ${isEdit ? "updated" : "created"} successfully!`);
      onSave();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const htmlPreview = body.trim()
    ? (marked.parse(body.trim(), { gfm: true, breaks: true }) as string)
    : "";

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-6 animate-in fade-in duration-300"
    >
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 w-fit -ml-1"
        onClick={onCancel}
      >
        <ArrowLeft size={16} />
        Back to Articles
      </Button>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Markdown editor */}
        <div className="xl:col-span-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
                Article Body <span className="text-red-500">*</span>
              </Label>
            </div>
            <div className="flex bg-[#F2F2F7] rounded-[10px] p-1 gap-1">
              <button
                type="button"
                onClick={() => setMdTab("write")}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all duration-150 ${
                  mdTab === "write"
                    ? "bg-primary text-white shadow-[0_1px_3px_rgba(0,0,0,0.10)]"
                    : "text-[#8E8E93] hover:text-[#1C1C1E]"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setMdTab("preview")}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all duration-150 ${
                  mdTab === "preview"
                    ? "bg-primary text-white shadow-[0_1px_3px_rgba(0,0,0,0.10)]"
                    : "text-[#8E8E93] hover:text-[#1C1C1E]"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {mdTab === "write" ? (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your article content in Markdown..."
              className="min-h-[500px] w-full rounded-md border border-border bg-transparent px-4 py-3 text-sm font-mono resize-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 placeholder:text-muted-foreground"
            />
          ) : (
            <div
              className="min-h-[500px] w-full rounded-md border border-border bg-transparent px-4 py-3 text-sm overflow-auto [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_p]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-0.5 [&_strong]:font-semibold [&_em]:italic"
              dangerouslySetInnerHTML={{ __html: htmlPreview }}
            />
          )}

          <p className="text-xs text-muted-foreground">
            {charCount} characters · {wordCount} words
          </p>
        </div>

        {/* Right: Metadata sidebar */}
        <div className="xl:col-span-2">
          <div className="border border-border rounded-xl p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Headline <span className="text-red-500">*</span>
              </Label>
              <TextInput
                name="headline"
                type="text"
                placeholder="Article headline..."
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Type <span className="text-red-500">*</span>
              </Label>
              <DropSelect
                selectName="type"
                selectId="article-type"
                value={type}
                onChange={(e) => setType(e.target.value as "news" | "blog")}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </DropSelect>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Publish Date <span className="text-red-500">*</span>
              </Label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
              />
            </div>

            <TagInput
              label="Tags"
              placeholder="e.g. property, investment"
              values={tags}
              onChange={setTags}
            />

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Photo URL
              </Label>
              <TextInput
                name="photoUrl"
                type="url"
                placeholder="https://..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
              {photoUrl && (
                <div className="mt-1 rounded-lg overflow-hidden border border-border h-28 bg-slate-50">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <div
                role="switch"
                aria-checked={isFeatured}
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${isFeatured ? "bg-primary" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isFeatured ? "translate-x-4" : "translate-x-0.5"}`}
                />
              </div>
              <span className="text-sm font-medium select-none">
                Featured article
              </span>
              {isFeatured && (
                <Star size={13} className="text-yellow-500 fill-yellow-400" />
              )}
            </label>

            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting
                  ? isEdit
                    ? "Saving..."
                    : "Publishing..."
                  : isEdit
                    ? "Save Changes"
                    : "Publish Article"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
