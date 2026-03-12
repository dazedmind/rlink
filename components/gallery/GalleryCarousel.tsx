"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryCarouselImage = {
  id: string;
  imageUrl: string;
  caption?: string | null;
};

type GalleryCarouselProps = {
  images?: GalleryCarouselImage[];
  projectId: string;
  modelId?: string | null;
  className?: string;
  aspectRatio?: "video" | "square";
};

/**
 * Fetches gallery from public API and renders as carousel.
 * Use when you have projectId and optionally modelId.
 * Pass images to skip fetch (e.g. from SSR).
 */
export function GalleryCarousel({
  images: initialImages = [],
  projectId,
  modelId = null,
  className,
  aspectRatio = "video",
}: GalleryCarouselProps) {
  const [images, setImages] = useState<GalleryCarouselImage[]>(initialImages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(!initialImages?.length);

  useEffect(() => {
    if (initialImages?.length) {
      setImages(initialImages);
      setIsLoading(false);
      return;
    }
    if (!projectId) return;
    const url = modelId
      ? `/api/public/projects/${projectId}/gallery?modelId=${encodeURIComponent(modelId)}`
      : `/api/public/projects/${projectId}/gallery`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setImages(Array.isArray(data) ? data : []);
      })
      .catch(() => setImages([]))
      .finally(() => setIsLoading(false));
  }, [projectId, modelId, initialImages]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % Math.max(1, images.length));
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) =>
      i === 0 ? Math.max(0, images.length - 1) : i - 1
    );
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(goNext, 5000);
    return () => clearInterval(t);
  }, [images.length, goNext]);

  if (isLoading) {
    return (
      <div
        className={cn(
          "relative rounded-lg overflow-hidden bg-muted animate-pulse",
          aspectRatio === "square" ? "aspect-square" : "aspect-video",
          className
        )}
      />
    );
  }

  if (!images.length) return null;

  const current = images[currentIndex];

  return (
    <div className={cn("relative group", className)}>
      <div
        className={cn(
          "relative rounded-lg overflow-hidden bg-muted",
          aspectRatio === "square" ? "aspect-square" : "aspect-video"
        )}
      >
        <Image
          src={current.imageUrl}
          alt={current.caption ?? "Gallery image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
          unoptimized={current.imageUrl.startsWith("/uploads")}
          priority
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i === currentIndex ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
      {current.caption && (
        <p className="text-sm text-muted-foreground text-center mt-1">
          {current.caption}
        </p>
      )}
    </div>
  );
}
