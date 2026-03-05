"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  FileText,
  Image as ImageIcon,
  Star,
} from "lucide-react";
import Image from "next/image";

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

const ITEMS_PER_PAGE = 10;

const TYPE_OPTIONS = [
  { value: "news", label: "News" },
  { value: "blog", label: "Blog" },
];

type NewsTableProps = {
  onEdit: (article: Article | null) => void;
  onDelete: (article: Article) => void;
  onView: (article: Article) => void;
  onAdd: () => void;
  refreshTrigger?: number;
};

export default function NewsTable({
  onEdit,
  onDelete,
  onView,
  onAdd,
  refreshTrigger = 0,
}: NewsTableProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [filterType, setFilterType] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");

  const activeFilterCount = filterType.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

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

  const fetchArticles = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const res = await fetch(buildUrl(page), { credentials: "include" });
        const data = await res.json();
        setArticles(data.data ?? []);
        setTotal(data.total ?? 0);
      } catch {
        toast.error("Failed to load articles.");
      } finally {
        setIsLoading(false);
      }
    },
    [buildUrl]
  );

  useEffect(() => { setCurrentPage(1); }, [filterType, sortOption]);
  useEffect(() => { fetchArticles(currentPage); }, [currentPage, fetchArticles, refreshTrigger]);

  const clearFilters = () => setFilterType([]);

  const toggleFilter = (value: string) =>
    setFilterType((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  const actionMenu = (row: Article) => [
    { label: "View",   icon: FileText, onClick: () => onView(row) },
    { label: "Edit",   icon: Pencil,   onClick: () => onEdit(row) },
    { label: "Delete", icon: Trash2,   color: "text-red-600", separator: true, onClick: () => onDelete(row) },
  ];

  return (
    <div className="border border-border rounded-xl overflow-hidden">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
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
              {TYPE_OPTIONS.map((opt) => (
                <DropdownMenuCheckboxItem
                  key={opt.value}
                  checked={filterType.includes(opt.value)}
                  onCheckedChange={() => toggleFilter(opt.value)}
                >
                  {opt.label}
                </DropdownMenuCheckboxItem>
              ))}
              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
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

      {/* Table */}
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            {["Headline", "Type", "Published", ""].map((col, i) => (
              <TableHead
                key={i}
                className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-gray-600"
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <TableCell key={j} className="px-6 py-4">
                    <div className="h-4 w-28 rounded bg-gray-100 animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="px-6 py-16 text-center text-sm text-muted-foreground">
                No articles found.{" "}
                {activeFilterCount > 0 && (
                  <button className="text-primary underline ml-1" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            articles.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-gray-50/50 cursor-pointer"
                onClick={() => onView(row)}
              >
                {/* ── Merged: star + thumbnail + headline ── */}
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Star — fixed width so it doesn't collapse */}
                    <div className="w-4 shrink-0">
                      {row.isFeatured && (
                        <Star size={14} className="text-amber-500 fill-amber-400" />
                      )}
                    </div>

                    {/* Thumbnail */}
                    {row.photoUrl ? (
                      <Image
                        src={row.photoUrl}
                        alt=""
                        className="rounded-md w-40 h-24 aspect-video object-cover"
                        width={100}
                        height={100}
                      />
                    ) : (
                      <div className="w-24 h-14 rounded-md bg-neutral-100 border border-border flex items-center justify-center shrink-0">
                        <ImageIcon className="size-4 text-muted-foreground/50" />
                      </div>
                    )}

                    {/* Headline */}
                    <p className="font-medium text-sm line-clamp-2 max-w-sm">
                      {row.headline}
                    </p>
                  </div>
                </TableCell>

                {/* Type */}
                <TableCell className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                    {row.type}
                  </span>
                </TableCell>

                {/* Published */}
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {shortDateFormatter(row.publishDate)}
                </TableCell>

                {/* Actions */}
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

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
        <p className="text-sm text-gray-600">
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
                  className={currentPage === pageNum ? "bg-blue-600 min-w-8" : "min-w-8"}
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