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
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  LogIn,
  LogOut,
  UserPlus,
  UserPen,
  UserMinus,
  Activity,
} from "lucide-react";
import { shortDateFormatter } from "@/app/utils/shortDateFormatter";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export type ActivityLogRecord = {
  id: string;
  userId: string;
  activity: string;
  ipAddress: string;
  userAgent: string;
  status: string;
  createdAt: string;
  userName?: string | null;
  userEmail?: string | null;
};

function getActivityIcon(activity: string) {
  const lower = activity.toLowerCase();
  if (lower.includes("login") || lower.includes("sign-in")) return LogIn;
  if (lower.includes("logout") || lower.includes("sign-out")) return LogOut;
  if (lower.includes("create") || lower.includes("added")) return UserPlus;
  if (lower.includes("update") || lower.includes("edit")) return UserPen;
  if (lower.includes("delete") || lower.includes("remove")) return UserMinus;
  return Activity;
}

type ActivityLogsTableProps = {
  refreshTrigger?: number;
};

export default function ActivityLogsTable({
  refreshTrigger = 0,
}: ActivityLogsTableProps) {
  const [logs, setLogs] = useState<ActivityLogRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState("newest");

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const fetchLogs = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/activity-logs?page=${page}&limit=${ITEMS_PER_PAGE}&sort=${sortOption}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Failed to load activity logs.");
        setLogs([]);
        setTotal(0);
        return;
      }
      const json = await res.json();
      const rows = (json.data ?? []).map((r: Record<string, unknown>) => ({
        ...r,
        createdAt:
          typeof r.createdAt === "string"
            ? r.createdAt
            : r.createdAt
              ? new Date(r.createdAt as Date).toISOString()
              : "",
      }));
      setLogs(rows);
      setTotal(json.total ?? 0);
    } catch {
      toast.error("Failed to load activity logs.");
      setLogs([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption]);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, fetchLogs, refreshTrigger]);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center justify-between w-full gap-2">
          <h3 className="font-semibold text-xl">Activity Logs</h3>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown size={14} />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={sortOption}
                onValueChange={setSortOption}
              >
                <DropdownMenuRadioItem value="newest">
                  Newest First
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">
                  Oldest First
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            {["Activity", "User", "IP Address", "Device", "Date", "Status"].map(
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
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="px-6 py-16 text-center text-sm text-muted-foreground"
              >
                No activity logs found.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((row) => {
              const Icon = getActivityIcon(row.activity);
              return (
                <TableRow key={row.id} className="hover:bg-gray-50/50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <span className="font-medium">
                        {row.activity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div>
                      <p className="font-medium">
                        {row.userName || row.userEmail || "—"}
                      </p>
                      {row.userEmail && row.userName && (
                        <p className="text-xs text-muted-foreground">
                          {row.userEmail}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {row.ipAddress}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    <p className="text-xs max-w-[300px] truncate">
                    {row.userAgent !== "unknown" ? row.userAgent : "—"}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {row.createdAt
                      ? shortDateFormatter(row.createdAt)
                      : "—"}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.status === "success"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      {row.status}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
        <p className="text-sm text-gray-600">
          {total} log{total !== 1 ? "s" : ""} total
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
