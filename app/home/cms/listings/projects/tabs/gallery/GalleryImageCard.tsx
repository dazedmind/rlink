"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "./types";

type GalleryImageCardProps = {
  image: GalleryImage;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
};

export function GalleryImageCard({
  image,
  isSelected,
  onToggleSelect,
  onDelete,
  isDeleting = false,
}: GalleryImageCardProps) {
  return (
    <div
      className={cn(
        "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
        isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"
      )}
      onClick={onToggleSelect}
    >
      <Image
        src={image.imageUrl}
        alt={image.caption ?? "Gallery image"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 25vw"
        unoptimized={image.imageUrl.startsWith("/uploads")}
      />
      {isDeleting && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
        </div>
      )}
      <div className="absolute top-2 left-2">
        <div
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
            isSelected ? "bg-primary border-primary" : "bg-white/80 border-white"
          )}
        >
          {isSelected && (
            <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={isDeleting}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
        aria-label="Delete image"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
