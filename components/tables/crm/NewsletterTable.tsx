"use client";
import React, { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  ArrowUpDown,
  Download,
  ListFilter,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
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
import { toast } from "sonner";
import { shortDateFormatter } from "@/app/utils/shortDateFormatter";
import { qk } from "@/lib/query-keys";
import { subscriberStatusMeta } from "@/lib/types";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import { Subscriber } from "@/lib/types";
import { TablePagination } from "@/components/tables/TablePagination";

const ITEMS_PER_PAGE = 10;

function NewsletterTable() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");
  const [deletingSubscriber, setDeletingSubscriber] = useState<Subscriber | null>(null);

  const activeFilterCount = filterStatus.length;

  const buildUrl = useCallback(
    (page: number, limit = ITEMS_PER_PAGE) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort: sortOption,
      });
      if (filterStatus.length > 0) params.set("status", filterStatus.join(","));
      return `/api/newsletter/subscriptions?${params}`;
    },
    [filterStatus, sortOption],
  );

  const filters = { page: currentPage, limit: ITEMS_PER_PAGE, sort: sortOption, status: filterStatus.join(",") };

  const { data, isLoading } = useQuery({
    queryKey: qk.newsletter(filters),
    queryFn: async () => {
      const res = await fetch(buildUrl(currentPage), { credentials: "include" });
      const json = await res.json();
      return { data: json.data ?? [], total: json.total ?? 0 };
    },
    placeholderData: (prev) => prev,
  });

  const subscribers = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const deleteMutation = useMutation({
    mutationFn: (email: string) =>
      fetch(`/api/newsletter/subscriptions/${encodeURIComponent(email)}`, { method: "DELETE", credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("Failed to remove subscriber");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.newsletter() });
      toast.success("Subscriber removed successfully");
      setDeletingSubscriber(null);
    },
    onError: () => {
      toast.error("Failed to remove subscriber");
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: ({ email, status }: { email: string; status: "subscribed" | "unsubscribed" }) =>
      fetch(`/api/newsletter/subscriptions/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, status }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to update subscription");
        return r.json();
      }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: qk.newsletter() });
      toast.success(status === "subscribed" ? "Subscription reactivated" : "Subscription deactivated");
    },
    onError: () => toast.error("Failed to update subscription"),
  });

  const handleConfirmDelete = () => {
    if (deletingSubscriber) deleteMutation.mutate(deletingSubscriber.email);
  };

  const toggleFilter = (
    value: string,
    current: string[],
    setter: (v: string[]) => void,
  ) => {
    setter(
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    );
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterStatus([]);
    setSortOption("newest");
    setCurrentPage(1);
  };

  // CSV exports ALL filtered records (separate unbounded fetch)
  const handleExportCSV = async () => {
    try {
      const response = await fetch(buildUrl(1, 10000), { credentials: "include" });
      const { data } = await response.json();
      const rows: Subscriber[] = data ?? [];

      const headers = ["Email", "Status", "Joined At"];
      const csvRows = rows.map((s) => [
        s.email,
        subscriberStatusMeta[s.status]?.label ?? s.status,
        shortDateFormatter(s.createdAt),
      ]);
      const csvContent = [
        headers.join(","),
        ...csvRows.map((row) =>
          row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Subscribers_Export_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${rows.length} subscribers`);
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 border-b bg-background flex justify-between items-center">
        <h3 className="font-semibold text-xl">Newsletter Subscribers</h3>

        <span className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
                <ListFilter className="size-4 mr-2" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 rounded-full bg-info px-1.5 text-[11px] text-white">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              {/* Sort */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-sm">
                  <ArrowUpDown className="size-3.5" /> Sort
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
                    <DropdownMenuRadioItem value="newest">Joined: Newest first</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">Joined: Oldest first</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="email_az">Email: A → Z</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="email_za">Email: Z → A</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuSeparator />

              {/* Status */}
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
                  {Object.entries(subscriberStatusMeta).map(([key, { label }]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={filterStatus.includes(key)}
                      onCheckedChange={() => toggleFilter(key, filterStatus, setFilterStatus)}
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

          <Button
            variant="default"
            size="sm"
            onClick={handleExportCSV}
          >
            <Download className="size-4 mr-2" />
            Export to CSV
          </Button>
        </span>
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-accent">
          <TableRow>
            {["", "Email", "Status", "Joined", ""].map((label, i) => (
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : subscribers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                No subscribers found.
              </TableCell>
            </TableRow>
          ) : (
            subscribers.map((row: Subscriber) => (
              <TableRow key={row.id} className="hover:bg-accent/50">
                <TableCell className="px-6 py-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </TableCell>

                <TableCell className="px-6 py-4">{row.email}</TableCell>

                <TableCell className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-md text-xs font-medium ${subscriberStatusMeta[row.status]?.className ?? ""}`}
                  >
                    {subscriberStatusMeta[row.status]?.label}
                  </span>
                </TableCell>

                <TableCell className="px-6 py-4">
                  {shortDateFormatter(row.createdAt)}
                </TableCell>

                <TableCell className="px-6 py-4 w-[300px]">
                  <span className="flex items-center gap-2">
                    {row.status === "subscribed" && (
                      <Button
                        onClick={() => subscribeMutation.mutate({ email: row.email, status: "unsubscribed" })}
                        variant="secondary"
                        size="sm"
                        className="bg-neutral-500/10 text-foreground flex flex-1 items-center gap-2 px-2"
                        disabled={subscribeMutation.isPending}
                      >
                        <UserMinus size={18} />
                        Unsubscribe
                      </Button>
                    )}
                    {row.status === "unsubscribed" && (
                      <Button
                        onClick={() => subscribeMutation.mutate({ email: row.email, status: "subscribed" })}
                        variant="secondary"
                        size="sm"
                        className="bg-green-600/10 text-green-700 flex flex-1 items-center gap-2 px-2"
                        disabled={subscribeMutation.isPending}
                      >
                        <Plus size={18} />
                        Re-subscribe
                      </Button>
                    )}
                    <Button
                      onClick={() => setDeletingSubscriber(row)}
                      variant="destructive"
                      size="sm"
                      className="w-fit items-center gap-2 px-2"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Footer — count + pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-background">
        <p className="text-sm text-muted-foreground">
          {activeFilterCount > 0
            ? `${total} matching subscribers`
            : `${total} subscribers total`}
        </p>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          activeClassName="bg-info min-w-8"
        />
      </div>

      <DeleteConfirmModal
        isOpen={deletingSubscriber !== null}
        onClose={() => setDeletingSubscriber(null)}
        onConfirm={handleConfirmDelete}
        itemName={deletingSubscriber?.email ?? ""}
        isDeleting={deleteMutation.isPending}
        title="Remove Subscriber"
        confirmLabel="Remove Subscriber"
      />
    </div>
  );
}

export default NewsletterTable;
