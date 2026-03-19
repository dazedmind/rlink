"use client";

import React, { useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FileUploadProps = {
  value?: string | null;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  hint?: string;
  className?: string;
  aspect?: "square" | "rectangle";
};

export function FileUpload({
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  label,
  hint,
  className,
  aspect = "rectangle",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </label>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors cursor-pointer min-h-[120px] flex flex-col items-center justify-center gap-2",
          value
            ? "border-none"
            : "border-border hover:border-primary/50 hover:bg-primary/5",
          isUploading && "pointer-events-none opacity-70"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFile}
          className="hidden"
        />
        {value ? (
          <>
            <div className={cn("relative rounded-md overflow-hidden bg-accent", aspect === "square" ? "aspect-square h-auto w-auto xl:max-h-40 xl:w-full" : "aspect-video max-h-36 w-full")}>
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={clear}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                <Trash2 size={14} />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-8">
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            ) : (
              <Upload className="size-8 text-muted-foreground" />
            )}
            <p className="text-sm font-medium text-muted-foreground">
              {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WebP, GIF (max 5MB)</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
