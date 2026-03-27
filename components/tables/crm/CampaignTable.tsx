"use client";
import React, { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { crmQueryOptions } from "@/lib/crm/crm-query-options";
import { fetchNewsletterCampaigns } from "@/lib/crm/crm-fetchers";
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
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import { campaignStatus, campaignStatusMeta, type Campaign } from "@/lib/types";
import { TablePagination } from "@/components/tables/TablePagination";

const ITEMS_PER_PAGE = 10;

type CampaignTableProps = {
  onOpenComposer?: (mode: "view" | "edit", campaign: Campaign) => void;
};

function CampaignTable({ onOpenComposer }: CampaignTableProps) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);

  const activeFilterCount = filterStatus.length;

  const filters = { page: currentPage, limit: ITEMS_PER_PAGE, sort: sortOption, status: filterStatus.join(",") };

  const { data, isLoading } = useQuery({
    queryKey: qk.newsletterCampaigns(filters),
    queryFn: () => fetchNewsletterCampaigns(filters),
    ...crmQueryOptions,
  });

  const campaigns = (data?.data ?? []) as Campaign[];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/newsletter/campaigns/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to delete campaign");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.newsletterCampaigns() });
      toast.success("Campaign deleted");
      setDeletingCampaign(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete campaign");
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/newsletter/campaigns/${id}/send`, {
        method: "POST",
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to send campaign");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.newsletterCampaigns() });
      queryClient.invalidateQueries({ queryKey: qk.newsletter() });
      toast.success("Campaign sent successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to send campaign");
    },
  });

  const buildActionMenu = useCallback(
    (row: Campaign) => {
      const items: { label: string; icon: typeof SendHorizontal; onClick: () => void; separator?: boolean; color?: string }[] = [];
      if (row.status !== "sent") {
        items.push(
          { label: "Send Now", icon: SendHorizontal, onClick: () => sendMutation.mutate(row.id) },
          { label: "Edit Campaign", icon: Pencil, onClick: () => onOpenComposer?.("edit", row) },
        );
      }
      items.push(
        { label: "View Campaign", icon: Eye, onClick: () => onOpenComposer?.("view", row) },
        { label: "Delete", icon: Trash2, color: "text-red-600 focus:text-red-600 focus:bg-red-50", onClick: () => setDeletingCampaign(row), separator: true },
      );
      return items;
    },
    [sendMutation, onOpenComposer],
  );

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

  const clearFilters = () => {
    setFilterStatus([]);
    setSortOption("newest");
    setCurrentPage(1);
  };

  const handleConfirmDelete = () => {
    if (deletingCampaign) deleteMutation.mutate(deletingCampaign.id);
  };


  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 border-b bg-background flex justify-between items-center">
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
                  onValueChange={(v) => {
                    setSortOption(v);
                    setCurrentPage(1);
                  }}
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
                {Object.entries(campaignStatusMeta).map(([key, { label }]) => (
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
        <TableHeader className="bg-accent">
          <TableRow>
            {["Campaign", "Status", "Recipients", "Open Rate", "Click Rate", "Date", "Sent", ""].map(
              (label, i) => (
                <TableHead
                  key={i}
                  className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-muted-foreground"
                >
                  {label}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j} className="px-6 py-4">
                      <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          ) : campaigns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="px-6 py-10 text-center text-sm text-muted-foreground">
                No campaigns found.
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((row: Campaign) => (
            <TableRow key={row.id} className="hover:bg-accent/50">
              <TableCell className="px-6 py-4">
                <p className="font-medium text-sm">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.subject}</p>
              </TableCell>

              <TableCell className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium gap-1 ${campaignStatusMeta[row.status]?.className ?? ""}`}
                > 
                  {row.status === "draft" && <CircleDashed size={12} className="text-slate-700" />}
                  {row.status === "scheduled" && <Clock size={12} className="text-yellow-700" />}
                  {row.status === "sent" && <Check size={12} className="text-blue-700" />}
                  {campaignStatusMeta[row.status]?.label ?? campaignStatus[row.status as keyof typeof campaignStatus]}
                </span>
              </TableCell>

              <TableCell className="px-6 py-4">
                {row.recipients || "—"}
              </TableCell>

              <TableCell className="px-6 py-4 min-w-[100px]">
                <span className="text-sm">{row.openRate ? `${row.openRate}%` : "—"}</span>
                <div className="w-full h-1 bg-muted rounded-full mt-1">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${row.openRate}%` }} />
                </div>
              </TableCell>

              <TableCell className="px-6 py-4 min-w-[100px]">
                <span className="text-sm">{row.clickRate ? `${row.clickRate}%` : "—"}</span>
                <div className="w-full h-1 bg-muted rounded-full mt-1">
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
          )))}
        </TableBody>
      </Table>

         {/* Footer — count + pagination */}
         <div className="flex items-center justify-between px-6 py-4 border-t bg-background">
        <p className="text-sm text-muted-foreground">
          {activeFilterCount > 0
            ? `${total} matching campaigns`
            : `${total} campaigns total`}
        </p>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          activeClassName="bg-blue-600 min-w-8"
        />
      </div>

      <DeleteConfirmModal
        isOpen={deletingCampaign !== null}
        onClose={() => setDeletingCampaign(null)}
        onConfirm={handleConfirmDelete}
        itemName={deletingCampaign?.name ?? ""}
        isDeleting={deleteMutation.isPending}
        title="Delete Campaign"
        confirmLabel="Delete Campaign"
      />
    </div>
  );
}

export default CampaignTable;