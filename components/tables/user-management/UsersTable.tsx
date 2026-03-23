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
import { Badge } from "@/components/ui/badge";
import ContextMenu from "@/components/layout/ContextMenu";
import { toast } from "sonner";
import {
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Pencil,
  Trash2,
  EllipsisVertical,
  BriefcaseBusiness,
  Download,
  ListFilter,
  X,
} from "lucide-react";
import { shortDateFormatter } from "@/app/utils/shortDateFormatter";
import type { UserRecord } from "@/components/modal/user-management/UserFormModal";
import { department, userRole, userRoleMeta } from "@/lib/types";

const ITEMS_PER_PAGE = 10;
const EXPORT_LIMIT = 10000;

type UsersTableProps = {
  onEdit: (user: UserRecord) => void;
  onDelete: (user: UserRecord) => void;
  onAdd: () => void;
  refreshTrigger?: number;
  viewOnly?: boolean;
};

export default function UsersTable({
  onEdit,
  onDelete,
  onAdd,
  refreshTrigger = 0,
  viewOnly,
}: UsersTableProps) {
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [filterRole, setFilterRole] = useState<string[]>([]);
  const [filterDepartment, setFilterDepartment] = useState<string[]>([]);

  const activeFilterCount = filterRole.length + filterDepartment.length;

  const fetchAllUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { authClient } = await import("@/lib/auth-client");
      const result = await authClient.admin.listUsers({
        query: {
          limit: EXPORT_LIMIT,
          offset: 0,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to load users.");
        setAllUsers([]);
        setTotal(0);
        return;
      }

      const data = result.data as { users?: UserRecord[]; total?: number } | undefined;
      setAllUsers((data?.users ?? []) as UserRecord[]);
      setTotal(data?.total ?? 0);
    } catch {
      toast.error("Failed to load users.");
      setAllUsers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers, refreshTrigger]);

  const filteredAndSorted = useMemo(() => {
    let result = [...allUsers];
    if (filterRole.length > 0) {
      result = result.filter((u) => u.role && filterRole.includes(u.role));
    }
    if (filterDepartment.length > 0) {
      result = result.filter(
        (u) => u.department && filterDepartment.includes(u.department)
      );
    }
    const dateAsc = (a: UserRecord, b: UserRecord) => {
      const ta = a.createdAt
        ? (typeof a.createdAt === "string"
            ? a.createdAt
            : (a.createdAt as Date).toISOString())
        : "";
      const tb = b.createdAt
        ? (typeof b.createdAt === "string"
            ? b.createdAt
            : (b.createdAt as Date).toISOString())
        : "";
      return ta < tb ? -1 : ta > tb ? 1 : 0;
    };
    const dateDesc = (a: UserRecord, b: UserRecord) => -dateAsc(a, b);
    const nameAsc = (a: UserRecord, b: UserRecord) =>
      (a.name ?? a.email ?? "").localeCompare(b.name ?? b.email ?? "");
    const nameDesc = (a: UserRecord, b: UserRecord) => -nameAsc(a, b);
    if (sortOption === "newest") result.sort(dateDesc);
    else if (sortOption === "oldest") result.sort(dateAsc);
    else if (sortOption === "name_az") result.sort(nameAsc);
    else if (sortOption === "name_za") result.sort(nameDesc);
    return result;
  }, [allUsers, filterRole, filterDepartment, sortOption]);

  const totalFiltered = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSorted, currentPage]);

  const toggleFilter = (
    value: string,
    current: string[],
    setter: (v: string[]) => void
  ) => {
    setter(
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterRole([]);
    setFilterDepartment([]);
    setSortOption("newest");
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const list = filteredAndSorted;
    const headers = [
      "Name",
      "Email",
      "Employee ID",
      "Role",
      "Department",
      "Position",
      "Date Created",
    ];
    const getDisplayName = (u: UserRecord) => {
      if (u.firstName || u.lastName) {
        return [u.firstName, u.lastName].filter(Boolean).join(" ") || u.name;
      }
      return (u.name || u.email) ?? "";
    };
    const csvRows = list.map((u) => [
      getDisplayName(u),
      u.email,
      u.employeeId ?? "",
      userRoleMeta[u.role as keyof typeof userRoleMeta]?.label ?? u.role ?? "",
      department[u.department as keyof typeof department] ?? u.department ?? "",
      u.position ?? "",
      u.createdAt
        ? shortDateFormatter(
            typeof u.createdAt === "string"
              ? u.createdAt
              : (u.createdAt as Date).toISOString()
          )
        : "",
    ]);
    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) =>
        row
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Users_Export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${list.length} users`);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption, filterRole, filterDepartment]);

  const actionMenu = (row: UserRecord) => [
    {
      label: "Edit",
      icon: Pencil,
      onClick: () => onEdit(row),
    },
    {
      label: "Delete",
      icon: Trash2,
      color: "text-destructive",
      separator: true,
      onClick: () => onDelete(row),
    },
  ];

  const getDisplayName = (user: UserRecord) => {
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name;
    }
    return user.name || user.email;
  };

  const displayUsers = viewOnly ? paginatedUsers.slice(0, 5) : paginatedUsers;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <h3 className="font-semibold text-xl">Users</h3>

        <span className="flex items-center gap-2">
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
            <DropdownMenuContent align="end" className="w-48">
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
                    <DropdownMenuRadioItem value="name_az">
                      Name: A → Z
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name_za">
                      Name: Z → A
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-sm">
                  Role
                  {filterRole.length > 0 && (
                    <Badge className="ml-auto h-4 min-w-4 rounded-full bg-blue-600 px-1 text-[10px] text-white">
                      {filterRole.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.entries(userRole).map(([key, label]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={filterRole.includes(key)}
                      onCheckedChange={() =>
                        toggleFilter(key, filterRole, setFilterRole)
                      }
                      onSelect={(e) => e.preventDefault()}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-sm">
                  Department
                  {filterDepartment.length > 0 && (
                    <Badge className="ml-auto h-4 min-w-4 rounded-full bg-blue-600 px-1 text-[10px] text-white">
                      {filterDepartment.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.entries(department).map(([key, label]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={filterDepartment.includes(key)}
                      onCheckedChange={() =>
                        toggleFilter(key, filterDepartment, setFilterDepartment)
                      }
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

          {!viewOnly && (
            <>
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 text-primary-foreground hover:brightness-110"
                onClick={handleExportCSV}
              >
                <Download className="size-4 mr-2" />
                Export to CSV
              </Button>
              <Button size="sm" className="gap-2" onClick={onAdd}>
                <PlusCircle size={14} />
                Add User
              </Button>
            </>
          )}
        </span>
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-accent">
          <TableRow>
            {["User", "Email", "Employee ID", "Role", "Department", "Created", ""].map(
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
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j} className="px-6 py-4">
                    <div className="h-4 w-28 rounded bg-accent/10 animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : displayUsers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="px-6 py-16 text-center text-sm text-muted-foreground"
              >
                No users found.
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
            displayUsers.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-accent/50 cursor-pointer"
                onClick={() => onEdit(row)}
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted/80 flex items-center justify-center">
                      {row.image ? (
                        <img
                          src={row.image}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground font-medium">
                          {row.name?.charAt(0) ?? "?"}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{getDisplayName(row)}</p>
                      {row.position && (
                        <p className="text-xs text-muted-foreground">
                          {row.position}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {row.email}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <BriefcaseBusiness
                      className="size-4 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                    {row.employeeId || "—"}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      userRoleMeta[row.role as keyof typeof userRoleMeta]?.className ??
                      "bg-muted text-muted-foreground"
                    }`}
                  >
                    {userRoleMeta[row.role as keyof typeof userRoleMeta]?.label ??
                      row.role ??
                      "—"}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {department[row.department as keyof typeof department] ||
                    row.department ||
                    "—"}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {row.createdAt
                    ? shortDateFormatter(
                        typeof row.createdAt === "string"
                          ? row.createdAt
                          : row.createdAt.toISOString()
                      )
                    : "—"}
                </TableCell>
                {!viewOnly && (
                  <TableCell
                    className="px-6 py-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ContextMenu
                      menu={actionMenu(row)}
                      triggerIcon={EllipsisVertical}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-background">
        <p className="text-sm text-muted-foreground">
          {activeFilterCount > 0
            ? `${totalFiltered} matching users`
            : `${totalFiltered} user${totalFiltered !== 1 ? "s" : ""} total`}
        </p>

        {totalPages > 1 && !viewOnly && (
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
                        ? "bg-primary min-w-8"
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
