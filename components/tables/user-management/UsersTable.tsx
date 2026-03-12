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
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "lucide-react";
import { shortDateFormatter } from "@/app/utils/shortDateFormatter";
import type { UserRecord } from "@/components/modal/user-management/UserFormModal";
import { department } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

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
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState("newest");

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const fetchUsers = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const { authClient } = await import("@/lib/auth-client");
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const result = await authClient.admin.listUsers({
        query: {
          limit: ITEMS_PER_PAGE,
          offset,
          sortBy: "createdAt",
          sortDirection: sortOption === "newest" ? "desc" : "asc",
        },
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to load users.");
        setUsers([]);
        setTotal(0);
        return;
      }

      const data = result.data as { users?: UserRecord[]; total?: number } | undefined;
      setUsers((data?.users ?? []) as UserRecord[]);
      setTotal(data?.total ?? 0);
    } catch {
      toast.error("Failed to load users.");
      setUsers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption]);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers, refreshTrigger]);

  const actionMenu = (row: UserRecord) => [
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

  const getDisplayName = (user: UserRecord) => {
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name;
    }
    return user.name || user.email;
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center justify-between w-full gap-2">
          <h3 className="font-semibold text-xl">Users</h3>

          <span className="flex items-center gap-2">
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
            {!viewOnly && (
                 <Button size="sm" className="gap-2" onClick={onAdd}>
                 <PlusCircle size={14} />
                 Add User
               </Button>
            )}
          </span>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-gray-50">
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
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j} className="px-6 py-4">
                    <div className="h-4 w-28 rounded bg-gray-100 animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="px-6 py-16 text-center text-sm text-muted-foreground"
              >
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.slice(0, viewOnly ? 5 : undefined).map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-gray-50/50 cursor-pointer"
                onClick={() => onEdit(row)}
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      {row.image ? (
                        <img
                          src={row.image}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <p className="text-sm font-medium">{row.name.charAt(0)}</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{getDisplayName(row)}</p>
                      {row.position && (
                        <p className="text-xs text-muted-foreground">{row.position}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {row.email}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <BriefcaseBusiness className="size-4 text-muted-foreground" strokeWidth={1.5}/>
                    {row.employeeId || "—"}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      row.role?.toLowerCase() === "admin"
                        ? "bg-blue-600/10 text-blue-600 border border-blue-600/20"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {(row.role?.charAt(0).toUpperCase() ?? "") + (row.role?.slice(1) ?? "")}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                  {department[row.department as keyof typeof department] || "—"}
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
                  <TableCell className="px-6 py-4 text-right">
                  <ContextMenu menu={actionMenu(row)} triggerIcon={EllipsisVertical} />
                </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
        <p className="text-sm text-gray-600">
          {total} user{total !== 1 ? "s" : ""} total
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
