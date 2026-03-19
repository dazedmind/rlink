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
import { shortDateFormatter } from "@/app/utils/shortDateFormatter";
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";
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
  MapPin,
  Eye,
} from "lucide-react";
import { Career, careerStatus, careerStatusMeta } from "@/lib/types";
import TableSkeleton from "@/components/layout/skeleton/TableSkeleton";

const ITEMS_PER_PAGE = 10;

type CareersTableProps = {
  onEdit: (career: Career) => void;
  onDelete: (career: Career) => void;
  onView: (career: Career) => void;
  onAdd: () => void;
};

export default function CareersTable({
  onEdit,
  onDelete,
  onView,
  onAdd,
}: CareersTableProps) {
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
      if (filterStatus.length > 0) params.set("status", filterStatus.join(","));
      return `/api/careers?${params}`;
    },
    [filterStatus, sortOption]
  );

  const filters = { page: currentPage, sort: sortOption, status: filterStatus.join(",") };

  const { data, isLoading } = useQuery({
    queryKey: qk.careers(filters),
    queryFn: async () => {
      const res = await fetch(buildUrl(currentPage), { credentials: "include" });
      const json = await res.json();
      if (Array.isArray(json)) {
        return { data: json, total: json.length };
      }
      return { data: json.data ?? [], total: json.total ?? 0 };
    },
    placeholderData: (prev) => prev,
  });

  const careers = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const clearFilters = () => setFilterStatus([]);

  const toggleFilter = (value: string) =>
    setFilterStatus((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  const actionMenu = (row: Career) => [
    { label: "View", icon: Eye, onClick: () => onView(row) },
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
        <TableSkeleton columnCount={6} rowCount={5} showFooter={false} />
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
              <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              {Object.values(careerStatus).map((opt) => (
                <DropdownMenuCheckboxItem
                  key={opt}
                  checked={filterStatus.includes(opt)}
                  onCheckedChange={() => toggleFilter(opt)}
                >
                  {opt}
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
                <DropdownMenuRadioItem value="name_asc">Position A–Z</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name_desc">Position Z–A</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button size="sm" className="gap-2" onClick={onAdd}>
          <PlusCircle size={14} />
          Add Job Posting
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-background">
          <TableRow>
            {["Position", "Location", "Status", "Posted", "Last Updated", ""].map(
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
          {careers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="px-6 py-16 text-center text-sm text-muted-foreground"
              >
                No job postings found.{" "}
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
            careers.map((row: Career) => (
              <TableRow
                key={row.id}
                className="hover:bg-accent cursor-pointer"
                onClick={() => onView(row)}
              >
                <TableCell className="px-6 py-4">
                  <p className="font-medium text-sm">{row.position}</p>
                  {row.jobDescription && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">
                      {row.jobDescription}
                    </p>
                  )}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin size={12} />
                    {row.location}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${careerStatusMeta[row.status as keyof typeof careerStatus]?.className}`}
                  >
                    {careerStatus[row.status as keyof typeof careerStatus]}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {shortDateFormatter(row.createdAt)}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {formatRelativeTime(row.updatedAt)}
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
            ? `${total} matching job postings`
            : `${total} job postings total`}
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
                  className={
                    currentPage === pageNum ? "bg-primary min-w-8" : "min-w-8"
                  }
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
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
