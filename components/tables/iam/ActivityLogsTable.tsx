"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { fetchActivityLogsPage } from "@/lib/iam/iam-fetchers";
import { iamTableQueryOptions } from "@/lib/iam/iam-query-options";
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
import { activityStatusMeta, ActivityLogRecord } from "@/lib/types";
import { TablePagination } from "@/components/tables/TablePagination";

const ITEMS_PER_PAGE = 10;

function getActivityIcon(activity: string) {
  const lower = activity.toLowerCase();
  if (lower.includes("login") || lower.includes("sign-in")) return LogIn;
  if (lower.includes("logout") || lower.includes("sign-out")) return LogOut;
  if (lower.includes("create") || lower.includes("added")) return UserPlus;
  if (lower.includes("update") || lower.includes("edit")) return UserPen;
  if (lower.includes("delete") || lower.includes("remove")) return UserMinus;
  return Activity;
}

export default function ActivityLogsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("newest");

  const queryFilters = useMemo(
    () => ({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sort: sortOption,
    }),
    [currentPage, sortOption]
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: qk.activityLogs(queryFilters),
    queryFn: () =>
      fetchActivityLogsPage({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: sortOption,
      }),
    ...iamTableQueryOptions,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption]);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {isError && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 border-b bg-destructive/5 text-sm">
          <span className="text-muted-foreground">Could not load activity logs.</span>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      )}
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
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
        <TableHeader className="bg-accent">
          <TableRow>
            {["Activity", "User", "IP Address", "Device", "Date", "Status"].map(
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
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j} className="px-6 py-4">
                    <div className="h-4 w-28 rounded bg-accent/10 animate-pulse" />
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
                <TableRow key={row.id} className="hover:bg-accent/50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-info/10 flex items-center justify-center">
                        <Icon className="size-4 text-info" />
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
                          activityStatusMeta[row.status as keyof typeof activityStatusMeta].className
                        }`}
                    >
                      {activityStatusMeta[row.status as keyof typeof activityStatusMeta].label}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-background">
        <p className="text-sm text-muted-foreground">
          {total} log{total !== 1 ? "s" : ""} total
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
