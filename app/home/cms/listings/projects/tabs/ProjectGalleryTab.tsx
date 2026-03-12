"use client";

import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useGallery, GalleryImageCard, GalleryToolbar } from "./gallery";
import type { ProjectModel } from "./project-types";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import DropSelect from "@/components/ui/DropSelect";

type ProjectGalleryTabProps = {
  projectId: string;
  models: ProjectModel[];
};

export default function ProjectGalleryTab({ projectId, models }: ProjectGalleryTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  const {
    images,
    selectedIds,
    isLoading,
    isUploading,
    isDeleting,
    addImages,
    deleteImages,
    toggleSelect,
    selectAll,
    clearSelection,
    deleteSelected,
  } = useGallery({
    projectId,
    modelId: selectedModelId,
    onError: (msg) => toast.error(msg),
  });

  const handleUploadClick = () => {
    if (isLoading || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        if (data.url) urls.push(data.url);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
        break;
      }
    }
    if (urls.length) addImages(urls);
    e.target.value = "";
  };

  if (projectId === "new") {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Save the project first to add gallery images.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end gap-4">
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <DropSelect
            label="Link to house model"
            selectName="selectedModelId"
            selectId="selectedModelId"
            onChange={(e) => setSelectedModelId(e.target.value || null)}
            value={selectedModelId ?? ""}
            required
           >
            <option value="">Project (General)</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.modelName}</option>
              ))}
            </DropSelect>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="default"
          size="lg"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="size-5" />
              Upload Photos
            </>
          )}
        </Button>
      </div>

      {images.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Gallery ({images.length} photos)
            </Label>
          </div>
          <GalleryToolbar
            selectedCount={selectedIds.size}
            totalCount={images.length}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onDeleteSelected={deleteSelected}
            isDeleting={isDeleting}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            {images.map((image) => (
              <GalleryImageCard
                key={image.id}
                image={image}
                isSelected={selectedIds.has(image.id)}
                onToggleSelect={() => toggleSelect(image.id)}
                onDelete={() => deleteImages([image.id])}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        </section>
      )}

      {images.length === 0 && !isLoading && (
        <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg">
          <p className="text-sm">No photos yet. Upload some above to get started.</p>
        </div>
      )}
    </div>
  );
}
