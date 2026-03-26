"use client";

import React from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PaginationItem = number | "ellipsis";

/**
 * Builds a compact page list with ellipsis when there are many pages.
 * Example: 1 … 4 5 6 … 20
 */
export function getPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingDelta = 1
): PaginationItem[] {
  if (totalPages < 1) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const left = Math.max(2, currentPage - siblingDelta);
  const right = Math.min(totalPages - 1, currentPage + siblingDelta);

  const items: PaginationItem[] = [1];

  if (left > 2) {
    items.push("ellipsis");
  } else {
    for (let i = 2; i < left; i++) {
      items.push(i);
    }
  }

  for (let i = left; i <= right; i++) {
    items.push(i);
  }

  if (right < totalPages - 1) {
    items.push("ellipsis");
  } else {
    for (let i = right + 1; i < totalPages; i++) {
      items.push(i);
    }
  }

  if (totalPages > 1) {
    items.push(totalPages);
  }

  return items;
}

export type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Extra classes for the active page button (theme per table). */
  activeClassName?: string;
  inactiveClassName?: string;
  className?: string;
  /** Optional label before controls, e.g. “Showing 3 of 12 pages”. */
  pageInfo?: React.ReactNode;
  /** Legacy: hide the previous control on page 1 (some CRM tables). */
  hidePreviousOnFirstPage?: boolean;
};

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  activeClassName = "bg-primary min-w-8",
  inactiveClassName = "min-w-8",
  className,
  pageInfo,
  hidePreviousOnFirstPage = false,
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(currentPage, totalPages);

  const prevButton = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      disabled={currentPage === 1}
      aria-label="Previous page"
    >
      <ChevronLeft size={16} />
    </Button>
  );

  const pageButtons = (
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {items.map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex min-w-8 items-center justify-center px-1 text-sm text-muted-foreground select-none"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={currentPage === item ? "default" : "ghost"}
            size="sm"
            className={cn(
              currentPage === item ? activeClassName : inactiveClassName
            )}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        )
      )}
    </div>
  );

  const nextButton = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      disabled={currentPage === totalPages}
      aria-label="Next page"
    >
      <ChevronRight size={16} />
    </Button>
  );

  const controls = (
    <div className="flex items-center gap-2">
      {hidePreviousOnFirstPage && currentPage <= 1 ? null : prevButton}
      {pageButtons}
      {nextButton}
    </div>
  );

  if (pageInfo) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        {pageInfo}
        {controls}
      </div>
    );
  }

  return <div className={cn("flex items-center gap-2", className)}>{controls}</div>;
}
