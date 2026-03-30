"use client";

import React, { useState, useMemo } from "react";
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
import ContextMenu from "@/components/layout/ContextMenu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { shortDateFormatter } from "@/app/utils/shortDateFormatter";
import {
  PlusCircle,
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
import { projectStatus, projectStage, projectType, projectStatusMeta, projectStageMeta, projectTypeMeta, Project } from "@/lib/types";
import { TablePagination } from "@/components/tables/TablePagination";
import TableSkeleton from "@/components/layout/skeleton/TableSkeleton";

const ITEMS_PER_PAGE = 10;

type ProjectsTableProps = {
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onAdd: () => void;
  onViewProject: (project: Project) => void;
};

export default function ProjectsTable({
  onEdit,
  onDelete,
  onAdd,
  onViewProject,
}: ProjectsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterStage, setFilterStage] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");

  const activeFilterCount =
    filterStatus.length + filterStage.length + filterType.length;

  const { data, isLoading } = useQuery({
    queryKey: qk.projects(),
    queryFn: async () => {
      const res = await fetch("/api/projects", { credentials: "include" });
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data ?? [];
      return list;
    },
  });

  const projects = data ?? [];

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

  const clearFilters = () => {
    setFilterStatus([]);
    setFilterStage([]);
    setFilterType([]);
    setSortOption("newest");
    setCurrentPage(1);
  };

  const toggleFilter = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setCurrentPage(1);
  };

  const actionMenu = (row: Project) => [
    { label: "Edit", icon: Pencil, onClick: () => onEdit(row) },
    {
      label: "Delete",
      icon: Trash2,
      className: "text-destructive hover:bg-destructive/10",
      onClick: () => onDelete(row),
    },
  ];

  if (isLoading) {
    return (
      <div className="border border-border rounded-xl overflow-hidden min-w-0 w-full max-w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
          <div className="h-9 w-48 rounded-md bg-muted animate-pulse" />
          <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
        </div>
        <TableSkeleton columnCount={9} rowCount={5} showFooter={false} />
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden min-w-0 w-full max-w-full animate-fade-in-up">
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
            <DropdownMenuContent align="start" className="w-56">
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
                    <DropdownMenuRadioItem value="name_asc">
                      Name: A → Z
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name_desc">
                      Name: Z → A
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
                  {Object.entries(projectStatus).map(([key, label]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={filterStatus.includes(key)}
                      onCheckedChange={() => toggleFilter(setFilterStatus, key)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-sm">
                  Stage
                  {filterStage.length > 0 && (
                    <Badge className="ml-auto h-4 min-w-4 rounded-full bg-blue-600 px-1 text-[10px] text-white">
                      {filterStage.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.entries(projectStage).map(([key, label]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={filterStage.includes(key)}
                      onCheckedChange={() => toggleFilter(setFilterStage, key)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-sm">
                  Type
                  {filterType.length > 0 && (
                    <Badge className="ml-auto h-4 min-w-4 rounded-full bg-blue-600 px-1 text-[10px] text-white">
                      {filterType.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.entries(projectType).map(([key, label]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={filterType.includes(key)}
                      onCheckedChange={() => toggleFilter(setFilterType, key)}
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
          Add Project
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-background">
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
                  className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-muted-foreground"
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects.length === 0 ? (
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
                <TableRow key={row.id} className="hover:bg-accent cursor-pointer" onClick={() => onViewProject(row)}>
                  <TableCell className="px-6 py-4">
                    {row.logoUrl ? (
                      <Image
                        src={row.logoUrl}
                        alt={row.projectName}
                        width={100}
                        height={100}
                        className="rounded-md w-fit h-fit aspect-video object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-auto bg-accent border border-border rounded-md w-full aspect-video object-cover">
                        <ImageIcon className="size-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="font-medium text-base">{row.projectName}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="font-mono text-xs font-semibold text-muted-foreground bg-accent px-2 py-1 rounded">
                      {row.projectCode}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">
                      {row.type ? (projectTypeMeta[row.type]?.label ?? projectType[row.type as keyof typeof projectType] ?? row.type) : "—"}
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
                          projectStatusMeta[row.status]?.className ?? ""
                        }`}
                      >
                        {projectStatusMeta[row.status]?.label ?? projectStatus[row.status as keyof typeof projectStatus] ?? row.status}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {row.stage ? (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          projectStageMeta[row.stage]?.className ?? ""
                        }`}
                      >
                        {projectStageMeta[row.stage]?.label ?? projectStage[row.stage as keyof typeof projectStage] ?? row.stage}
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
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t bg-background">
        <p className="text-sm text-muted-foreground">
          {activeFilterCount > 0
            ? `${total} matching projects`
            : `${total} projects total`}
        </p>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          activeClassName="bg-primary min-w-8"
        />
      </div>
    </div>
  );
}
