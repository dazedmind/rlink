"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import ContextMenu from "@/components/layout/ContextMenu";
import { toast } from "sonner";
import { shortDateFormatter } from "@/app/utils/shortDateFormatter";
import {
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  EllipsisVertical,
  ListFilter,
  ArrowUpDown,
  X,
  MapPin,
  Image as ImageIcon,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";

type ProjectStatus = "sold" | "available";
type ProjectStage = "pre_selling" | "ongoing_development" | "completed" | "cancelled";
type ProjectType = "houselot" | "condo";

export type Project = {
  id: string;
  projectCode: string;
  projectName: string;
  status: ProjectStatus | null;
  location: string | null;
  stage: ProjectStage | null;
  type: ProjectType;
  photoUrl: string | null;
  accentColor: string | null;
  description: string | null;
  amenities: unknown[];
  landmarks: unknown[];
  createdAt: string;
  updatedAt: string;
};

const statusMeta: Record<string, { label: string; className: string }> = {
  available: {
    label: "Available",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  sold: {
    label: "Sold Out",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

const stageMeta: Record<string, { label: string; className: string }> = {
  pre_selling: {
    label: "Pre-Selling",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  ongoing_development: {
    label: "Ongoing Development",
    className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  },
  completed: {
    label: "Completed",
    className: "bg-slate-100 text-slate-700 border border-slate-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-400 border border-red-100",
  },
};

const typeMeta: Record<string, { label: string }> = {
  houselot: { label: "House & Lot" },
  condo: { label: "Condominium" },
};

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "sold", label: "Sold Out" },
];

const STAGE_OPTIONS = [
  { value: "pre_selling", label: "Pre-Selling" },
  { value: "ongoing_development", label: "Ongoing Development" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const TYPE_OPTIONS = [
  { value: "houselot", label: "House & Lot" },
  { value: "condo", label: "Condominium" },
];

const ITEMS_PER_PAGE = 10;

type ProjectsTableProps = {
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onAdd: () => void;
  refreshTrigger?: number;
  onViewProject: (project: Project) => void;
};

export default function ProjectsTable({
  onEdit,
  onDelete,
  onAdd,
  refreshTrigger = 0,
  onViewProject,
}: ProjectsTableProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterStage, setFilterStage] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");

  const activeFilterCount =
    filterStatus.length + filterStage.length + filterType.length;

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/projects", { credentials: "include" });
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.data ?? [];
      setProjects(list);
    } catch {
      toast.error("Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, refreshTrigger]);

  const filteredAndSorted = useMemo(() => {
    let result = [...projects];
    if (filterStatus.length > 0) {
      result = result.filter((p) => p.status && filterStatus.includes(p.status));
    }
    if (filterStage.length > 0) {
      result = result.filter((p) => p.stage && filterStage.includes(p.stage));
    }
    if (filterType.length > 0) {
      result = result.filter((p) => filterType.includes(p.type));
    }
    const a = (x: Project, y: Project) => {
      const ta = x.createdAt ?? "";
      const tb = y.createdAt ?? "";
      return ta > tb ? -1 : ta < tb ? 1 : 0;
    };
    const b = (x: Project, y: Project) => {
      const ta = x.createdAt ?? "";
      const tb = y.createdAt ?? "";
      return ta < tb ? -1 : ta > tb ? 1 : 0;
    };
    const nameAsc = (x: Project, y: Project) =>
      (x.projectName ?? "").localeCompare(y.projectName ?? "") || x.id.localeCompare(y.id);
    const nameDesc = (x: Project, y: Project) =>
      (y.projectName ?? "").localeCompare(x.projectName ?? "") || x.id.localeCompare(y.id);
    if (sortOption === "newest") result.sort(a);
    else if (sortOption === "oldest") result.sort(b);
    else if (sortOption === "name_asc") result.sort(nameAsc);
    else if (sortOption === "name_desc") result.sort(nameDesc);
    return result;
  }, [projects, filterStatus, filterStage, filterType, sortOption]);

  const total = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSorted, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterStage, filterType, sortOption]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const clearFilters = () => {
    setFilterStatus([]);
    setFilterStage([]);
    setFilterType([]);
  };

  const toggleFilter = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const actionMenu = (row: Project) => [
    {
      label: "Edit",
      icon: Pencil,
      onClick: () => onEdit(row),
    },
    {
      label: "Delete",
      icon: Trash2,
      className: "text-destructive hover:bg-destructive/10",
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
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <DropdownMenuCheckboxItem
                      key={opt.value}
                      checked={filterStatus.includes(opt.value)}
                      onCheckedChange={() => toggleFilter(setFilterStatus, opt.value)}
                    >
                      {opt.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stage
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {STAGE_OPTIONS.map((opt) => (
                    <DropdownMenuCheckboxItem
                      key={opt.value}
                      checked={filterStage.includes(opt.value)}
                      onCheckedChange={() => toggleFilter(setFilterStage, opt.value)}
                    >
                      {opt.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <DropdownMenuCheckboxItem
                      key={opt.value}
                      checked={filterType.includes(opt.value)}
                      onCheckedChange={() => toggleFilter(setFilterType, opt.value)}
                    >
                      {opt.label}
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
                <DropdownMenuRadioItem value="name_asc">Name A–Z</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name_desc">Name Z–A</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button size="sm" className="gap-2" onClick={onAdd}>
          <PlusCircle size={14} />
          Add Project
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            {[
              "Project Image",
              "Project",
              "Code",
              "Type",
              "Location",
              "Status",
              "Stage",
              "Created",
              "",
            ].map((label, i) => (
              <TableHead
                key={i}
                className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-gray-600"
              >
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 9 }).map((_, j) => (
                  <TableCell key={j} className="px-6 py-4">
                    <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : projects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="px-6 py-16 text-center text-sm text-muted-foreground"
              >
                No projects found.{" "}
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
            paginatedProjects.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={()=>onViewProject(row)}>
                <TableCell className="px-6 py-4">
                  {row.photoUrl ? (
                    <Image
                      src={row.photoUrl}
                      alt={row.projectName}
                      width={100}
                      height={100}
                      className="rounded-md w-full h- aspect-video object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-auto bg-neutral-200 rounded-md w-full aspect-video object-cover">
                      <ImageIcon className="size-6 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <p className="font-medium text-base">{row.projectName}</p>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="font-mono text-xs font-semibold text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                    {row.projectCode}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-sm text-muted-foreground">
                    {typeMeta[row.type]?.label ?? row.type}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {row.location ? (
                      <>
                        <MapPin size={12} />
                        {row.location}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  {row.status ? (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        statusMeta[row.status]?.className ?? ""
                      }`}
                    >
                      {statusMeta[row.status]?.label ?? row.status}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="px-6 py-4">
                  {row.stage ? (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stageMeta[row.stage]?.className ?? ""
                      }`}
                    >
                      {stageMeta[row.stage]?.label ?? row.stage}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {shortDateFormatter(row.createdAt)}
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
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
            ? `${total} matching projects`
            : `${total} projects total`}
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
