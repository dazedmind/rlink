"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  ArrowUpDown,
  Eye,
  ListFilter,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { dateFormatter } from "@/app/utils/dateFormatter";
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
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Campaign = {
  id: number;
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sent";
  sentAt: string;
  openRate: number;
  clickRate: number;
  recipients: number;
};

const statusMeta: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600 border border-slate-200" },
  scheduled: { label: "Scheduled", className: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  sent:  { label: "Sent",  className: "bg-blue-50 text-blue-700 border border-blue-200" },
};

const ActionMenu = ({ status }: { status: "draft" | "scheduled" | "sent" }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <MoreHorizontal size={16} />
        <span className="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {status === "draft" && (
        <>
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <Send size={14} /> Send Now
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItem className="gap-2 cursor-pointer">
        <Eye size={14} /> View
      </DropdownMenuItem>
      <DropdownMenuItem className="gap-2 cursor-pointer">
        <Pencil size={14} /> Edit
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 focus:text-red-600">
        <Trash2 size={14} /> Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const ITEMS_PER_PAGE = 10;

function CampaignTable() {
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
      const response = await fetch(buildUrl(page));
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

  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    if (filterStatus.length > 0)
      result = result.filter((c) => filterStatus.includes(c.status));

    switch (sortOption) {
      case "newest":
        result.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
        break;
      case "name_az":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_za":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [filterStatus, sortOption]);

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
            {["Campaign", "Status", "Recipients", "Open Rate", "Click Rate", "Date", ""].map(
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
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusMeta[row.status]?.className ?? ""}`}
                >
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
                {dateFormatter(row.sentAt)}
              </TableCell>

              <TableCell className="px-6 py-4 text-right">
                <ActionMenu status={row.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="px-6 py-3 border-t bg-white">
        <p className="text-sm text-gray-600">
          {activeFilterCount > 0
            ? `${campaigns.length} of ${total} campaigns`
            : `${campaigns.length} campaigns total`}
        </p>
      </div>
    </div>
  );
}

export default CampaignTable;
