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
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import type { Promo } from "@/components/modal/cms/PromoFormModal";
import Image from "next/image";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
];

const statusMeta: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-slate-500 text-white border border-slate-200",
  },
  active: {
    label: "Active",
    className: "bg-emerald-500 text-white border border-emerald-200",
  },
  expired: {
    label: "Expired",
    className: "bg-red-500 text-white border border-red-100",
  },
};

type PromosTableProps = {
  onEdit: (promo: Promo) => void;
  onDelete: (promo: Promo) => void;
  onView: (promo: Promo) => void;
  onAdd: () => void;
  refreshTrigger?: number;
};

export default function PromosTable({
  onEdit,
  onDelete,
  onView,
  onAdd,
  refreshTrigger = 0,
}: PromosTableProps) {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");

  const activeFilterCount = filterStatus.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const buildUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        sort: sortOption,
      });
      if (filterStatus.length > 0)
        params.set("status", filterStatus.join(","));
      return `/api/promos?${params}`;
    },
    [filterStatus, sortOption]
  );

  const fetchPromos = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const res = await fetch(buildUrl(page), { credentials: "include" });
        const data = await res.json();
        setPromos(data.data ?? []);
        setTotal(data.total ?? 0);
      } catch {
        toast.error("Failed to load promos.");
      } finally {
        setIsLoading(false);
      }
    },
    [buildUrl]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, sortOption]);

  useEffect(() => {
    fetchPromos(currentPage);
  }, [currentPage, fetchPromos, refreshTrigger]);

  const clearFilters = () => setFilterStatus([]);

  const toggleFilter = (value: string) =>
    setFilterStatus((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  const actionMenu = (row: Promo) => [
    {
      label: "View",
      icon: Tag,
      onClick: () => onView(row),
    },
    {
      label: "Edit",
      icon: Pencil,
      onClick: () => onEdit(row),
    },
    {
      label: "Delete",
      icon: Trash2,
      color: "text-red-600",
      separator: true,
      onClick: () => onDelete(row),
    },
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
                Status
              </p>
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuCheckboxItem
                  key={opt.value}
                  checked={filterStatus.includes(opt.value)}
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
          Add Promo
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            {["Promo", "Status", "Start Date", "End Date", ""].map(
              (col, i) => (
                <TableHead
                  key={i}
                  className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-gray-600"
                >
                  {col}
                </TableHead>
              )
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j} className="px-6 py-4">
                    <div className="h-4 w-28 rounded bg-gray-100 animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : promos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="px-6 py-16 text-center text-sm text-muted-foreground"
              >
                No promos found.{" "}
                {activeFilterCount > 0 && (
                  <button
                    className="text-primary underline ml-1"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            promos.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-gray-50/50 cursor-pointer"
                onClick={() => onView(row)}
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span>
                      {row.imageUrl ? (
                        <Image
                          src={row.imageUrl}
                          alt=""
                          className="h-30 w-30 aspect-square rounded-md object-cover"
                          width={100}
                          height={100}
                        />
                      ) : (
                        <div className="h-12 w-20 rounded-md bg-neutral-200 flex items-center justify-center">
                          <ImageIcon className="size-5 text-muted-foreground" />
                        </div>
                      )}
                    </span>
                    <span>
                      <p className="font-bold text-lg line-clamp-2 max-w-xs">
                        {row.title}
                      </p>
                      {row.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">
                          {row.description}
                        </p>
                      )}
                    </span>
                  </div>
            
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      statusMeta[row.status]?.className ??
                      "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {statusMeta[row.status]?.label ?? row.status}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {row.startDate
                    ? shortDateFormatter(row.startDate)
                    : "—"}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {row.endDate
                    ? shortDateFormatter(row.endDate)
                    : "—"}
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

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
        <p className="text-sm text-gray-600">
          {activeFilterCount > 0
            ? `${total} matching promos`
            : `${total} promos total`}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    className={
                      currentPage === pageNum
                        ? "bg-blue-600 min-w-8"
                        : "min-w-8"
                    }
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
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
