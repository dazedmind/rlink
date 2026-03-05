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
  BriefcaseBusiness,
  MapPin,
} from "lucide-react";
import { Career } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

type CareersTableProps = {
  onEdit: (career: Career) => void;
  onDelete: (career: Career) => void;
  onView: (career: Career) => void;
  onAdd: () => void;
  refreshTrigger?: number;
};

const careerStatus = {
  hiring: "Hiring",
  closed: "Closed",
  archived: "Archived",
} as const;

export default function CareersTable({
  onEdit,
  onDelete,
  onView,
  onAdd,
  refreshTrigger = 0,
}: CareersTableProps) {
  const [careers, setCareers] = useState<Career[]>([]);
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
      if (filterStatus.length > 0) params.set("status", filterStatus.join(","));
      return `/api/careers?${params}`;
    },
    [filterStatus, sortOption]
  );

  const fetchCareers = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const res = await fetch(buildUrl(page), { credentials: "include" });
        const data = await res.json();
        if (Array.isArray(data)) {
          setCareers(data);
          setTotal(data.length);
        } else {
          setCareers(data.data ?? []);
          setTotal(data.total ?? 0);
        }
      } catch {
        toast.error("Failed to load job postings.");
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
    fetchCareers(currentPage);
  }, [currentPage, fetchCareers, refreshTrigger]);

  const clearFilters = () => setFilterStatus([]);

  const toggleFilter = (value: string) =>
    setFilterStatus((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  const actionMenu = (row: Career) => [
    {
      label: "View",
      icon: BriefcaseBusiness,
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
              {Object.values(Career).map((opt) => (
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

      {/* Table */}
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            {["Position", "Location", "Status", "Posted", "Last Updated", ""].map(
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
          ) : careers.length === 0 ? (
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
            careers.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-gray-50/50 cursor-pointer"
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
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      row.status === careerStatus.hiring.toLowerCase()
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : row.status === careerStatus.closed.toLowerCase()
                          ? "bg-slate-100 text-slate-600 border border-slate-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                    }`}
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

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
        <p className="text-sm text-gray-600">
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
                    currentPage === pageNum ? "bg-blue-600 min-w-8" : "min-w-8"
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
