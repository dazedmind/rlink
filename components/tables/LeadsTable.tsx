"use client";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Download,
  EllipsisVertical,
  Eye,
  ListFilter,
  MailIcon,
  PhoneIcon,
  Trash2,
  User,
} from "lucide-react";
import { dateFormatter } from "@/app/utils/dateFormatter";
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  leadStatus,
  type LeadStatus,
  leadNextAction,
  type LeadNextAction,
} from "@/lib/types";
import { leadStage, type LeadStage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadDetailModal } from "@/components/modal/LeadDetailModal";
import ContextMenu from "../layout/ContextMenu";
import { toast } from "sonner";
import Link from "next/link";

type Lead = {
  id: number;
  leadId: string;
  status: LeadStatus;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  inquiryDate: string;
  project: string;
  profileLink: string;
  stage: LeadStage;
  nextAction: LeadNextAction;
  createdAt: string;
  updatedAt: string;
};

function LeadsTable({
  table_name,
  recentViewOnly,
}: {
  table_name: string;
  recentViewOnly: boolean;
}) {
  const ITEMS_PER_PAGE = 10;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterStage, setFilterStage] = useState<string[]>([]);
  const [filterNextAction, setFilterNextAction] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("newest");

  const activeFilterCount =
    filterStatus.length + filterStage.length + filterNextAction.length;

  const buildUrl = useCallback(
    (page: number, limit = ITEMS_PER_PAGE) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort: sortOption,
      });
      if (filterStatus.length > 0) params.set("status", filterStatus.join(","));
      if (filterStage.length > 0) params.set("stage", filterStage.join(","));
      if (filterNextAction.length > 0) params.set("nextAction", filterNextAction.join(","));
      return `/api/leads?${params}`;
    },
    [filterStatus, filterStage, filterNextAction, sortOption],
  );

  const fetchLeads = useCallback(async () => {
    try {
      const limit = recentViewOnly ? 3 : ITEMS_PER_PAGE;
      const response = await fetch(buildUrl(currentPage, limit));
      const { data, total: responseTotal } = await response.json();
      setLeads(data ?? []);
      setTotal(responseTotal ?? 0);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeads([]);
      setTotal(0);
    }
  }, [buildUrl, currentPage, recentViewOnly]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const totalPages = recentViewOnly ? 1 : Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

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
    setFilterStage([]);
    setFilterNextAction([]);
    setSortOption("newest");
    setCurrentPage(1);
  };

  // 1. Define your Column Configuration
  const columns = [
    { label: "Lead ID", key: "leadId" },
    { label: "Status", key: "status" },
    { label: "Client Name", key: "clientName" },
    { label: "Contact", key: "contact" },
    // These columns only show if recentViewOnly is false
    { label: "Inquiry Date", key: "inquiryDate", hideOnRecent: true },
    { label: "Last Update", key: "updatedAt", hideOnRecent: true },
    { label: "Stage", key: "stage", hideOnRecent: true },
    { label: "Next Action", key: "nextAction", hideOnRecent: true },
    { label: "", key: "actions", hideOnRecent: true },
  ];

  // 2. Filter columns based on the prop
  const visibleColumns = useMemo(() => {
    return recentViewOnly 
      ? columns.filter(col => !col.hideOnRecent) 
      : columns;
  }, [recentViewOnly]);

  const statusStyles: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    ongoing: "bg-purple-100 text-purple-700",
    follow_up: "bg-yellow-100 text-yellow-700",
    no_response: "bg-neutral-100 text-neutral-700",
    ineligible: "bg-neutral-100 text-neutral-700",
    won: "bg-green-100 text-green-700",
    lost: "bg-red-100 text-red-700",
  };

  const handleRowClick = (row: Lead) => {
    setSelectedLead(row);
    setIsModalOpen(true);
  };

  const handleDeleteLead = async (id: number) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to delete lead");
      }
      toast.success("Lead deleted successfully");
      fetchLeads();
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete lead");
    }
  };
  
  const actionMenu = (row: Lead) => [
    {
      label: "View Lead",
      icon: Eye,
      onClick: () => handleRowClick(row),
    },
    {
      label: "View Profile",
      icon: User,
      onClick: () => <Link href={row.profileLink ?? ""} target="_blank">View Profile</Link>,
    },
    {
      label: "Delete Lead",
      icon: Trash2,
      color: "text-red-600 focus:text-red-600 focus:bg-red-50",
      onClick: () => handleDeleteLead(row.id),
    },
  ];

  const handleExportCSV = async () => {
    try {
      const response = await fetch(buildUrl(1, 10000));
      const { data } = await response.json();
      const rows: Lead[] = data ?? [];

      const headers = [
        "Lead ID", "Status", "First Name", "Last Name",
        "Email", "Phone", "Project", "Stage", "Next Action", "Inquiry Date",
      ];
      const csvRows = rows.map((lead) => [
        lead.leadId,
        leadStatus[lead.status as keyof typeof leadStatus] || lead.status,
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.phone,
        lead.project,
        leadStage[lead.stage as keyof typeof leadStage] || lead.stage,
        leadNextAction[lead.nextAction as keyof typeof leadNextAction] || lead.nextAction,
        dateFormatter(lead.inquiryDate),
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
      link.setAttribute("download", `Leads_Export_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${rows.length} leads`);
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl bg-white animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-xl">{table_name}</h3>

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
            <DropdownMenuContent align="end" className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>

              {/* Sort */}
              <DropdownMenuLabel className="flex items-center gap-2 text-xs uppercase text-gray-500">
                <ArrowUpDown className="size-3" /> Sort
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortOption} onValueChange={(v) => { setSortOption(v); setCurrentPage(1); }}>
                <DropdownMenuRadioItem value="newest">Inquiry: Newest first</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">Inquiry: Oldest first</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="updated_newest">Updated: Newest first</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="updated_oldest">Updated: Oldest first</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name_az">Name: A → Z</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name_za">Name: Z → A</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs uppercase text-gray-500">Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.entries(leadStatus).map(([key, label]) => (
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
              {/* Status */}
          

              <DropdownMenuSeparator />

              {/* Stage */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs uppercase text-gray-500">Stage</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.entries(leadStage).map(([key, label]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={filterStage.includes(key)}
                      onCheckedChange={() => toggleFilter(key, filterStage, setFilterStage)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {/* Next Action */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs uppercase text-gray-500">Next Action</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.entries(leadNextAction).map(([key, label]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={filterNextAction.includes(key)}
                      onCheckedChange={() => toggleFilter(key, filterNextAction, setFilterNextAction)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Clear */}
              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
                    onClick={clearFilters}
                  >
                    Clear all filters
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

      {/* shadcn/ui Table */}
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            {visibleColumns.map((col, i) => (
              <TableHead
                key={i}
                className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-gray-600"
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {leads.map((row) => (
            <TableRow key={row.id} onClick={() => handleRowClick(row)} className="hover:bg-blue-600/10 cursor-pointer">
              <TableCell className="px-6 py-4 font-medium text-neutral-500">
                {row.leadId}
              </TableCell>

              <TableCell className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[row.status]}`}>
                  {leadStatus[row.status as keyof typeof leadStatus]}
                </span>
              </TableCell>

              <TableCell className="px-6 py-4">{row.firstName} {row.lastName}</TableCell>

              <TableCell className="px-6 py-4">
                <span className="flex flex-col">
                  <span className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                    <PhoneIcon size={12} /> {row.phone}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-gray-500">
                    <MailIcon size={12} /> {row.email}
                  </span>
                </span>
              </TableCell>

              {/* Conditional rendering for the remaining cells */}
              {!recentViewOnly && (
                <>
                  <TableCell className="px-6 py-4">{dateFormatter(row.inquiryDate)}</TableCell>
                  <TableCell className="px-6 py-4">{formatRelativeTime(row.updatedAt)}</TableCell>
                  <TableCell className="px-6 py-4 text-primary font-medium">{leadStage[row.stage as keyof typeof leadStage]}</TableCell>
                  <TableCell className="px-6 py-4 text-primary font-medium">{leadNextAction[row.nextAction as keyof typeof leadNextAction]}</TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <ContextMenu
                      menu={actionMenu(row)}
                      triggerIcon={EllipsisVertical}
                    />
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Footer with Pagination */}
      {!recentViewOnly && (
        <div className="flex justify-between items-center bg-white px-6 py-4 border-t">
          <p className="text-sm text-gray-600">
            {activeFilterCount > 0
              ? `${total} matching leads`
              : `${total} leads total`}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {currentPage} of {totalPages} pages
              </span>
              {currentPage > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ArrowLeft size={16} />
                </Button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    className={currentPage === pageNum ? "bg-blue-600" : ""}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ),
              )}
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
          </div>
        </div>
      )}

      <LeadDetailModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={() => {
          fetchLeads();
        }}
      />
    </div>
  );
}

export default LeadsTable;