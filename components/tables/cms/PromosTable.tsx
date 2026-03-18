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
import type { Promo } from "@/lib/types";
import Image from "next/image";
import { promoStatus, promoStatusMeta } from "@/lib/types";
import TableSkeleton from "@/components/layout/skeleton/TableSkeleton";

const ITEMS_PER_PAGE = 10;

type PromosTableProps = {
  onEdit: (promo: Promo) => void;
  onDelete: (promo: Promo) => void;
  onView: (promo: Promo) => void;
  onAdd: () => void;
};

export default function PromosTable({
  onEdit,
  onDelete,
  onView,
  onAdd,
}: PromosTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");

  const activeFilterCount = filterStatus.length;

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

  const filters = { page: currentPage, sort: sortOption, status: filterStatus.join(",") };

  const { data, isLoading } = useQuery({
    queryKey: qk.promos(filters),
    queryFn: async () => {
      const res = await fetch(buildUrl(currentPage), { credentials: "include" });
      const json = await res.json();
      return { data: json.data ?? [], total: json.total ?? 0 };
    },
    placeholderData: (prev) => prev,
  });

  const promos = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const clearFilters = () => setFilterStatus([]);

  const toggleFilter = (value: string) =>
    setFilterStatus((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  const actionMenu = (row: Promo) => [
    { label: "View", icon: Tag, onClick: () => onView(row) },
    { label: "Edit", icon: Pencil, onClick: () => onEdit(row) },
    {
      label: "Delete",
      icon: Trash2,
      color: "text-red-600",
      separator: true,
      onClick: () => onDelete(row),
    },
  ];

  if (isLoading) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div className="h-9 w-48 rounded-md bg-muted animate-pulse" />
          <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
        </div>
        <TableSkeleton columnCount={5} rowCount={5} showHeaderActions={false} showFooter={false} />
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden animate-fade-in-up">
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
              {Object.entries(promoStatus).map(([key, label]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={filterStatus.includes(key)}
                  onCheckedChange={() => toggleFilter(key)}
                >
                  {label}
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
          {promos.length === 0 ? (
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
            promos.map((row: Promo) => (
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
                      promoStatusMeta[row.status]?.className ??
                      "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {promoStatusMeta[row.status]?.label ?? row.status}
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
