"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ContextMenu from "@/components/layout/ContextMenu";
import { toast } from "sonner";
import { Article, articleType } from "@/lib/types";
import { shortDateFormatter } from "@/app/utils/shortDateFormatter";
import {
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  ListFilter,
  ArrowUpDown,
  X,
  Pencil,
  Trash2,
  EllipsisVertical,
  Image as ImageIcon,
  Star,
  Eye,
} from "lucide-react";
import Image from "next/image";
import TableSkeleton from "@/components/layout/skeleton/TableSkeleton";

const ITEMS_PER_PAGE = 10;

type NewsTableProps = {
  onEdit: (article: Article | null) => void;
  onDelete: (article: Article) => void;
  onView: (article: Article) => void;
  onAdd: () => void;
};

export default function NewsTable({
  onEdit,
  onDelete,
  onView,
  onAdd,
}: NewsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");

  const activeFilterCount = filterType.length;

  const buildUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        sort: sortOption,
      });
      if (filterType.length > 0) params.set("type", filterType.join(","));
      return `/api/articles?${params}`;
    },
    [filterType, sortOption]
  );

  const filters = { page: currentPage, sort: sortOption, type: filterType.join(",") };

  const { data, isLoading } = useQuery({
    queryKey: qk.articles(filters),
    queryFn: async () => {
      const res = await fetch(buildUrl(currentPage), { credentials: "include" });
      const json = await res.json();
      return { data: json.data ?? [], total: json.total ?? 0 };
    },
    placeholderData: (prev) => prev,
  });

  const articles = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const clearFilters = () => setFilterType([]);

  const toggleFilter = (value: string) =>
    setFilterType((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  const actionMenu = (row: Article) => [
    { label: "View",   icon: Eye, onClick: () => onView(row) },
    { label: "Edit",   icon: Pencil,   onClick: () => onEdit(row) },
    { label: "Delete", icon: Trash2,   color: "text-destructive", separator: true, onClick: () => onDelete(row) },
  ];

  if (isLoading) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
          <div className="h-9 w-48 rounded-md bg-muted animate-pulse" />
          <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
        </div>
        <TableSkeleton columnCount={4} rowCount={5} showFooter={false} />
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden animate-fade-in-up">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ListFilter size={14} />
                Filter
                {activeFilterCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary text-white text-[10px] px-1.5 py-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Type
              </p>
              {Object.entries(articleType).map(([key, label]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={filterType.includes(key)}
                  onCheckedChange={() => toggleFilter(key)}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded"
                    onClick={clearFilters}
                  >
                    <X className="size-3" /> Clear all filters
                  </button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown size={14} />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button size="sm" className="gap-2" onClick={onAdd}>
          <PlusCircle size={14} />
          Add Article
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-background">
          <TableRow>
            {["Headline", "Type", "Published", ""].map((col, i) => (
              <TableHead
                key={i}
                className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-muted-foreground"
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="px-6 py-16 text-center text-sm text-muted-foreground">
                No articles found.{" "}
                {activeFilterCount > 0 && (
                  <button className="text-primary underline ml-1 cursor-pointer" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            articles.map((row: Article) => (
              <TableRow
                key={row.id}
                className="hover:bg-background/50 cursor-pointer"
                onClick={() => onView(row)}
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-4 shrink-0">
                      {row.isFeatured && (
                        <Star size={14} className="text-amber-500 fill-amber-400" />
                      )}
                    </div>

                    {row.photoUrl ? (
                      <Image
                        src={row.photoUrl}
                        alt=""
                        className="rounded-md w-40 h-24 aspect-video object-cover"
                        width={200}
                        height={200}
                      />
                    ) : (
                      <div className="w-40 h-24 rounded-md bg-accent flex items-center justify-center shrink-0">
                        <ImageIcon className="size-4 text-muted-foreground/50" />
                      </div>
                    )}

                    <p className="ml-4 font-medium line-clamp-2 max-w-lg text-wrap">
                      {row.headline}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs uppercase font-medium bg-background/10 text-muted-foreground border border-border">
                    {row.type}
                  </span>
                </TableCell>

                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {shortDateFormatter(row.publishDate)}
                </TableCell>

                <TableCell
                  className="px-6 py-4 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ContextMenu menu={actionMenu(row)} triggerIcon={EllipsisVertical} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-6 py-4 border-t bg-background">
        <p className="text-sm text-muted-foreground">
          {activeFilterCount > 0 ? `${total} matching articles` : `${total} articles total`}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ArrowLeft size={16} />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  size="sm"
                  className={currentPage === pageNum ? "bg-primary min-w-8" : "min-w-8"}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
