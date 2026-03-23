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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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

const truncateDescription = (description: string) => {
  return description.length > 250 ? description.substring(0, 250) + "..." : description;
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

  const clearFilters = () => {
    setFilterStatus([]);
    setSortOption("newest");
    setCurrentPage(1);
  };

  const toggleFilter = (value: string) => {
    setFilterStatus((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setCurrentPage(1);
  };

  const actionMenu = (row: Promo) => [
    { label: "View", icon: Tag, onClick: () => onView(row) },
    { label: "Edit", icon: Pencil, onClick: () => onEdit(row) },
    {
      label: "Delete",
      icon: Trash2,
      color: "text-destructive",
      separator: true,
      onClick: () => onDelete(row),
    },
  ];

  if (isLoading) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
          <div className="h-9 w-48 rounded-md bg-muted animate-pulse" />
          <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
        </div>
        <TableSkeleton columnCount={5} rowCount={5} showFooter={false} />
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden animate-fade-in-up">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <ListFilter className="size-4 mr-2" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 rounded-full bg-blue-600 px-1.5 text-[11px] text-white">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-sm">
                  <ArrowUpDown className="size-3.5" /> Sort
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={sortOption}
                    onValueChange={(v) => {
                      setSortOption(v);
                      setCurrentPage(1);
                    }}
                  >
                    <DropdownMenuRadioItem value="newest">
                      Date: Newest first
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">
                      Date: Oldest first
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-sm">
                  Status
                  {filterStatus.length > 0 && (
                    <Badge className="ml-auto h-4 min-w-4 rounded-full bg-blue-600 px-1 text-[10px] text-white">
                      {filterStatus.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.entries(promoStatus).map(([key, label]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={filterStatus.includes(key)}
                      onCheckedChange={() => toggleFilter(key)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

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
        </div>

        <Button size="sm" className="gap-2" onClick={onAdd}>
          <PlusCircle size={14} />
          Add Promo
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-background">
          <TableRow>
            {["Promo", "Status", "Promo Period", ""].map(
              (col, i) => (
                <TableHead
                  key={i}
                  className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-muted-foreground"
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
                    className="text-primary underline ml-1 cursor-pointer"
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
                className="hover:bg-background/50 cursor-pointer"
                onClick={() => onView(row)}
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="shrink-0">
                      {row.imageUrl ? (
                        <Image
                          src={row.imageUrl}
                          alt=""
                          className="h-30 w-30 aspect-square rounded-md object-cover"
                          width={100}
                          height={100}
                        />
                      ) : (
                        <div className="h-30 w-30 rounded-md bg-accent border border-border flex items-center justify-center">
                          <ImageIcon className="size-5 text-muted-foreground" />
                        </div>
                      )}
                    </span>
                    <span className="flex-1 w-xs">
                      <p className="font-bold text-lg line-clamp-2 max-w-xs">
                        {row.title}
                      </p>
                      {row.description && (
                        <p className="flex text-xs text-muted-foreground mt-0.5 line-clamp-1 text-wrap">
                          {truncateDescription(row.description)}
                        </p>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      promoStatusMeta[row.status]?.className ??
                      "bg-background/10 text-muted-foreground border border-border"
                    }`}
                  >
                    {promoStatusMeta[row.status]?.label ?? row.status}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {row.startDate
                    ? shortDateFormatter(row.startDate)
                    : "—"}
                  {" - "}
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

      <div className="flex items-center justify-between px-6 py-4 border-t bg-background">
        <p className="text-sm text-muted-foreground">
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
