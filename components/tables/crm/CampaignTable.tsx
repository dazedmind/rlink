"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  ArrowUpDown,
  Eye,
  ListFilter,
  Pencil,
  Send,
  Trash2,
  X,
  ArrowLeft,
  ArrowRight,
  EllipsisVertical,
  SendHorizontal,
  Clock,
  Check,
  CircleDashed,
} from "lucide-react";
import { toast } from "sonner";
import { shortDateFormatter } from "@/app/utils/shortDateFormatter";
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
import ContextMenu from "../../layout/ContextMenu";

type Campaign = {
  id: number;
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sent";
  sentAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  openRate: number;
  clickRate: number;
  recipients: number;
  body?: string;
  previewLine?: string;
};

const statusMeta: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600 border border-slate-200" },
  scheduled: { label: "Scheduled", className: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  sent:  { label: "Sent",  className: "bg-blue-50 text-blue-700 border border-blue-200" },
};


const ITEMS_PER_PAGE = 10;

type CampaignTableProps = {
  onOpenComposer?: (mode: "view" | "edit", campaign: Campaign) => void;
};

function CampaignTable({ onOpenComposer }: CampaignTableProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
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
      return `/api/newsletter/campaigns?${params}`;
    },
    [filterStatus, sortOption],
  );
  
  const fetchCampaigns = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(buildUrl(page), { credentials: "include" });
      const { data, total: responseTotal } = await response.json();
      setCampaigns(data ?? []);
      setTotal(responseTotal ?? 0);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaigns([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => {
    fetchCampaigns(currentPage);
  }, [currentPage, fetchCampaigns]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/newsletter/campaigns/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete");
      toast.success("Campaign deleted");
      fetchCampaigns(currentPage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete campaign");
    }
  }, [currentPage, fetchCampaigns]);

  const handleSendNow = useCallback(async (row: Campaign) => {
    try {
      const res = await fetch(`/api/newsletter/campaigns/${row.id}/send`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      toast.success("Campaign sent successfully");
      fetchCampaigns(currentPage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send campaign");
    }
  }, [currentPage, fetchCampaigns]);

  const buildActionMenu = useCallback((row: Campaign) => {
    const items: { label: string; icon: typeof SendHorizontal; onClick: () => void; separator?: boolean; color?: string }[] = [];
    if (row.status !== "sent") {
      items.push({ label: "Send Now", icon: SendHorizontal, onClick: () => handleSendNow(row) },
      { label: "Edit Campaign", icon: Pencil, onClick: () => onOpenComposer?.("edit", row) },);
    }
    items.push(
      { label: "View Campaign", icon: Eye, onClick: () => onOpenComposer?.("view", row) },
      { label: "Delete", icon: Trash2, color: "text-red-600 focus:text-red-600 focus:bg-red-50", onClick: () => { if (confirm(`Delete "${row.name}"?`)) handleDelete(row.id); }, separator: true }
    );
    return items;
  }, [handleSendNow, handleDelete, onOpenComposer]);

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
  };

  const clearFilters = () => {
    setFilterStatus([]);
    setSortOption("newest");
  };


  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 border-b bg-white flex justify-between items-center">
        <h3 className="font-semibold text-xl">Campaigns List</h3>

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
                <DropdownMenuRadioGroup
                  value={sortOption}
                  onValueChange={setSortOption}
                >
                  <DropdownMenuRadioItem value="newest">Date: Newest first</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">Date: Oldest first</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name_az">Name: A → Z</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name_za">Name: Z → A</DropdownMenuRadioItem>
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
                {Object.entries(statusMeta).map(([key, { label }]) => (
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
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            {["Campaign", "Status", "Recipients", "Open Rate", "Click Rate", "Date", "Sent", ""].map(
              (label, i) => (
                <TableHead
                  key={i}
                  className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-gray-600"
                >
                  {label}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {campaigns.map((row) => (
            <TableRow key={row.id} className="hover:bg-gray-50/50">
              <TableCell className="px-6 py-4">
                <p className="font-medium text-sm">{row.name}</p>
                <p className="text-xs text-gray-500">{row.subject}</p>
              </TableCell>

              <TableCell className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium gap-1 ${statusMeta[row.status]?.className ?? ""}`}
                > 
                  {row.status === "draft" && <CircleDashed size={12} className="text-slate-700" />}
                  {row.status === "scheduled" && <Clock size={12} className="text-yellow-700" />}
                  {row.status === "sent" && <Check size={12} className="text-blue-700" />}
                  {statusMeta[row.status]?.label}
                </span>
              </TableCell>

              <TableCell className="px-6 py-4">
                {row.recipients || "—"}
              </TableCell>

              <TableCell className="px-6 py-4 min-w-[100px]">
                <span className="text-sm">{row.openRate ? `${row.openRate}%` : "—"}</span>
                <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${row.openRate}%` }} />
                </div>
              </TableCell>

              <TableCell className="px-6 py-4 min-w-[100px]">
                <span className="text-sm">{row.clickRate ? `${row.clickRate}%` : "—"}</span>
                <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${row.clickRate}%` }} />
                </div>
              </TableCell>

              <TableCell className="px-6 py-4">
                {shortDateFormatter(row.createdAt)}
              </TableCell>

              <TableCell className="px-6 py-4">
                {row.status === "scheduled" && row.scheduledAt
                  ? shortDateFormatter(row.scheduledAt)
                  : row.sentAt
                    ? shortDateFormatter(row.sentAt)
                    : "—"}
              </TableCell>

              <TableCell className="px-6 py-4 text-right">
                <ContextMenu
                  menu={buildActionMenu(row)}
                  triggerIcon={EllipsisVertical}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

         {/* Footer — count + pagination */}
         <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
        <p className="text-sm text-gray-600">
          {activeFilterCount > 0
            ? `${total} matching campaigns`
            : `${total} campaigns total`}
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

export default CampaignTable;