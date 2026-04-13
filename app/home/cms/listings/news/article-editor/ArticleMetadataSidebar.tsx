"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star, Plus, X, Calendar as CalendarIcon } from "lucide-react";
import TextInput from "@/components/ui/TextInput";
import DropSelect from "@/components/ui/DropSelect";
import { FileUpload } from "@/components/ui/FileUpload";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { nameToSlug } from "@/app/utils/nameToSlug";
import { articleType, ArticleType } from "@/lib/types";

/** Parse YYYY-MM-DD as local date to avoid timezone shifts */
function parseDateOnly(str: string): Date | undefined {
  if (!str || str.length < 10) return undefined;
  const [y, m, d] = str.split("-").map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return undefined;
  return new Date(y, m - 1, d);
}

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
              className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-accent text-muted-foreground text-xs font-medium border border-border"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(i)}
                className="hover:text-destructive transition-colors cursor-pointer bg-primary/10 hover:bg-destructive/10 p-0.5 rounded-full"
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

type ArticleMetadataSidebarProps = {
  headline: string;
  setHeadline: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  type: ArticleType;
  setType: (v: ArticleType) => void;
  publishDate: string;
  setPublishDate: (v: string) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  photoUrl: string;
  setPhotoUrl: (v: string) => void;
  isFeatured: boolean;
  setIsFeatured: (v: boolean) => void;
  isEdit: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function ArticleMetadataSidebar({
  headline,
  setHeadline,
  slug,
  setSlug,
  type,
  setType,
  publishDate,
  setPublishDate,
  tags,
  setTags,
  photoUrl,
  setPhotoUrl,
  isFeatured,
  setIsFeatured,
  isEdit,
  onSubmit,
  onCancel,
}: ArticleMetadataSidebarProps) {
  const [schedulePopoverOpen, setSchedulePopoverOpen] = useState(false);

  const handleConfirmSchedule = () => {
    setSchedulePopoverOpen(false);
  };

  return (
    <div className="xl:col-span-2">
      <div className="border border-border rounded-xl p-5 flex flex-col gap-4">
        <FileUpload
          label="Article Photo"
          value={photoUrl}
          onChange={setPhotoUrl}
        />
        <TextInput
          label="Headline"
          name="headline"
          type="text"
          placeholder="e.g. The latest news from the Philippines"
          value={headline}
          onChange={(e) => {
            setHeadline(e.target.value);
            if (!slug) setSlug(nameToSlug(e.target.value));
          }}
          required={true}
        />

        <TextInput
          label="Slug"
          name="slug"
          type="text"
          placeholder="e.g. the-latest-news-from-the-philippines"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required={true}
        />
        <p className="text-[11px] text-muted-foreground -mt-2">
          URL-friendly identifier. Auto-generated from headline when empty.
        </p>

        <DropSelect
          label="Type"
          selectName="type"
          selectId="article-type"
          value={type}
          onChange={(e) => setType(e.target.value as ArticleType)}
          required={true}
        >
          {Object.entries(articleType).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </DropSelect>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Publish Date <span className="text-destructive">*</span>
          </Label>
          <Popover open={schedulePopoverOpen} onOpenChange={setSchedulePopoverOpen}>
            <PopoverTrigger className="w-full text-start flex items-center justify-between" asChild>
              <Button variant="outline" className="border-slate-200 font-medium gap-2">
                {/* <CalendarIcon size={14} /> Select Publish Date */}
                {publishDate ? (
                  <span className="text-sm">
                    {(() => {
                      const d = parseDateOnly(publishDate);
                      return d ? format(d, "MMM d, yyyy") : publishDate.slice(0, 10);
                    })()}
                  </span>
                ) : (
                  <div className="flex items-center text-muted-foreground gap-2">
                    <CalendarIcon size={14} />
                    <p>Select Publish Date</p>
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="top" sideOffset={8}>
              <div className="p-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Date</Label>
                  <Calendar
                    mode="single"
                    selected={parseDateOnly(publishDate)}
                    onSelect={(date) =>
                      setPublishDate(date ? format(date, "yyyy-MM-dd") : "")
                    }
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setSchedulePopoverOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="default" size="sm" className="flex-1" onClick={handleConfirmSchedule}>
                    Confirm
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      
        <TagInput
          label="Tags"
          placeholder="e.g. property, investment"
          values={tags}
          onChange={setTags}
        />

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

        <div className="flex gap-2 pt-2 border-t border-border justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {isEdit ? "Save Changes" : "Publish Article"}
          </Button>
        </div>
      </div>
    </div>
  );
}
