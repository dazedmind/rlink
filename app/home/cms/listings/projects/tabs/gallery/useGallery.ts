"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GalleryImage } from "./types";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";

type UseGalleryOptions = {
  projectId: string;
  modelId?: string | null;
  onError?: (message: string) => void;
};

export function useGallery({ projectId, modelId = null, onError }: UseGalleryOptions) {
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const { guard, release } = useSubmitGuard();

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    if (!projectId || projectId === "new") {
      setImages([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const url = modelId
        ? `/api/projects/${projectId}/gallery?modelId=${encodeURIComponent(modelId)}`
        : `/api/projects/${projectId}/gallery`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load gallery");
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load gallery";
      onErrorRef.current?.(msg);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, modelId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const addImages = useCallback(
    async (urls: string[]) => {
      if (!projectId || projectId === "new") return;
      const valid = urls.filter((u) => u?.trim());
      if (valid.length === 0) return;
      if (!guard()) return;
      try {
        const res = await fetch(`/api/projects/${projectId}/gallery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ imageUrls: valid, modelId: modelId || null }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to add images");
        await fetchImages();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to add images";
        onErrorRef.current?.(msg);
      } finally {
        release();
      }
    },
    [projectId, modelId, fetchImages, guard, release]
  );

  const deleteImages = useCallback(
    async (ids: string[]) => {
      if (!projectId || projectId === "new" || ids.length === 0) return;
      if (!guard()) return;
      try {
        const res = await fetch(
          `/api/projects/${projectId}/gallery?ids=${ids.join(",")}`,
          { method: "DELETE", credentials: "include" }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to delete images");
        setSelectedIds((prev) => {
          const next = new Set(prev);
          ids.forEach((id) => next.delete(id));
          return next;
        });
        await fetchImages();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to delete images";
        onErrorRef.current?.(msg);
      } finally {
        release();
      }
    },
    [projectId, fetchImages, guard, release]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(images.map((i) => i.id)));
  }, [images]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    deleteImages(Array.from(selectedIds));
  }, [selectedIds, deleteImages]);

  return {
    images,
    selectedIds,
    isLoading,
    fetchImages,
    addImages,
    deleteImages,
    toggleSelect,
    selectAll,
    clearSelection,
    deleteSelected,
  };
}
