"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Download,
  Eye,
  ListFilter,
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
import { subscriberStatusMeta } from "@/lib/types";

type Subscriber = {
  id: number;
  email: string;
  status: "subscribed" | "unsubscribed";
  createdAt: string;
};

const ITEMS_PER_PAGE = 10;

function NewsletterTable() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");

  const activeFilterCount = filterStatus.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Build API URL from current state
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

  const fetchSubscribers = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(buildUrl(page));
      const { data, total: responseTotal } = await response.json();
      setSubscribers(data ?? []);
      setTotal(responseTotal ?? 0);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      setSubscribers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [buildUrl]);

  // Re-fetch whenever page, filters, or sort changes
  useEffect(() => {
    fetchSubscribers(currentPage);
  }, [currentPage, fetchSubscribers]);

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
      const response = await fetch(buildUrl(1, 10000));
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

  const subscriptionUrl = useCallback((email: string) => {
    return `/api/newsletter/subscriptions/${encodeURIComponent(email)}`;
  }, []);

  const handleUnsubscribe = async (email: string) => {
    try {
      const response = await fetch(subscriptionUrl(email), {
        method: "PATCH",
        body: JSON.stringify({ email, status: "unsubscribed" }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to unsubscribe");
      }
      toast.info("Subscription Deactivated for " + email);
      fetchSubscribers(currentPage);
    }
    catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Failed to unsubscribe");
    }
  };

  const handleSubscribe = async (email: string) => {
    try {
      const response = await fetch(subscriptionUrl(email), {
        method: "PATCH",
        body: JSON.stringify({ email, status: "subscribed" }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to subscribe");
      }
      toast.success("Subscription Reactivated for " + email);
      fetchSubscribers(currentPage);
    }
    catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Failed to subscribe");
    }
  };

  const handleRemove = async (email: string) => {
    try {
      const response = await fetch(subscriptionUrl(email), {
        method: "DELETE",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to remove");
      }
      toast.success("Subscriber removed successfully");
      fetchSubscribers(currentPage);
    }
    catch (error) {
      console.error("Error removing:", error);
      toast.error("Failed to remove");
    }
  };
  
  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 border-b bg-white flex justify-between items-center">
        <h3 className="font-semibold text-xl">Newsletter Subscribers List</h3>

        <span className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
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
            className="bg-blue-600 text-primary-foreground hover:brightness-110"
            onClick={handleExportCSV}
          >
            <Download className="size-4 mr-2" />
            Export to CSV
          </Button>
        </span>
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            {["", "Email", "Status", "Joined", ""].map((label, i) => (
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
            <TableRow>
              <TableCell colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                Loading…
              </TableCell>
            </TableRow>
          ) : subscribers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                No subscribers found.
              </TableCell>
            </TableRow>
          ) : (
            subscribers.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50/50">
                <TableCell className="px-6 py-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </TableCell>

                <TableCell className="px-6 py-4">{row.email}</TableCell>

                <TableCell className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${subscriberStatusMeta[row.status]?.className ?? ""}`}
                  >
                    {subscriberStatusMeta[row.status]?.label}
                  </span>
                </TableCell>

                <TableCell className="px-6 py-4">
                  {shortDateFormatter(row.createdAt)}
                </TableCell>

                <TableCell className="px-6 py-4">
                  <span className="flex items-center gap-2">
                    {row.status === "subscribed" && (
                      <Button onClick={() => handleUnsubscribe(row.email)} variant="outline" size="sm" className="flex flex-1 items-center gap-2 px-2">
                        <UserMinus size={18} />
                        Unsubscribe
                      </Button>
                    )}
                    {row.status === "unsubscribed" && (
                      <Button onClick={() => handleSubscribe(row.email)} variant="outline" size="sm" className="flex flex-1 items-center gap-2 px-2">
                        <UserPlus size={18} />
                        Subscribe
                      </Button>
                    )}
                    <Button onClick={() => handleRemove(row.email)} variant="outline" size="sm" className="flex flex-1 items-center gap-2 px-2 text-red-600 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={18} />
                      Remove
                    </Button>
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Footer — count + pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
        <p className="text-sm text-gray-600">
          {activeFilterCount > 0
            ? `${total} matching subscribers`
            : `${total} subscribers total`}
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
                  className={currentPage === pageNum ? "bg-blue-600 min-w-8" : "min-w-8"}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

export default NewsletterTable;
