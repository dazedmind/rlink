"use client";
import {
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
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  leadStatus,
  type LeadStatus,
  leadNextAction,
  type LeadNextAction,
  leadStatusMeta,
} from "@/lib/types";
import { leadStage, type LeadStage } from "@/lib/types";
import { qk } from "@/lib/query-keys";
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
import { LeadDetailModal } from "@/components/modal/crm/LeadDetailModal";
import ContextMenu from "../../layout/ContextMenu";
import { toast } from "sonner";
import Link from "next/link";
import { shortDateFormatter } from "@/app/utils/shortDateFormatter";
import TableSkeleton from "@/components/layout/skeleton/TableSkeleton";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import { TablePagination } from "@/components/tables/TablePagination";

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
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterStage, setFilterStage] = useState<string[]>([]);
  const [filterNextAction, setFilterNextAction] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("newest");

  const activeFilterCount =
    filterStatus.length + filterStage.length + filterNextAction.length;

  const buildUrl = (
    page: number,
    limit = ITEMS_PER_PAGE,
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort: sortOption,
    });
    if (filterStatus.length > 0) params.set("status", filterStatus.join(","));
    if (filterStage.length > 0) params.set("stage", filterStage.join(","));
    if (filterNextAction.length > 0) params.set("nextAction", filterNextAction.join(","));
    return `/api/leads?${params}`;
  };

  const filters = {
    page: currentPage,
    limit: recentViewOnly ? 3 : ITEMS_PER_PAGE,
    sort: sortOption,
    status: filterStatus.join(","),
    stage: filterStage.join(","),
    nextAction: filterNextAction.join(","),
  };

  const { data, isLoading } = useQuery({
    queryKey: qk.leads(filters),
    queryFn: async () => {
      const limit = recentViewOnly ? 3 : ITEMS_PER_PAGE;
      const res = await fetch(buildUrl(currentPage, limit));
      const json = await res.json();
      return { data: json.data ?? [], total: json.total ?? 0 };
    },
    placeholderData: (prev) => prev,
  });

  const leadsData = data?.data ?? [];
  const totalData = data?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/leads/${id}`, { method: "DELETE" }).then((r) => {
        if (!r.ok) return r.json().then((err) => { throw new Error(err.error ?? "Failed to delete"); });
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.leads() });
      toast.success("Lead deleted successfully");
      setDeletingLead(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete lead");
    },
  });

  const totalPages = recentViewOnly ? 1 : Math.max(1, Math.ceil(totalData / ITEMS_PER_PAGE));

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

  const columns = [
    { label: "Lead ID", key: "leadId" },
    { label: "Status", key: "status" },
    { label: "Client Name", key: "clientName" },
    { label: "Contact", key: "contact" },
    { label: "Inquiry Date", key: "inquiryDate", hideOnRecent: true },
    { label: "Last Update", key: "updatedAt", hideOnRecent: true },
    { label: "Stage", key: "stage", hideOnRecent: true },
    { label: "Next Action", key: "nextAction", hideOnRecent: true },
    { label: "", key: "actions", hideOnRecent: true },
  ];

  const visibleColumns = useMemo(() => {
    return recentViewOnly
      ? columns.filter(col => !col.hideOnRecent)
      : columns;
  }, [recentViewOnly]);

  const handleRowClick = (row: Lead) => {
    setSelectedLead(row);
    setIsModalOpen(true);
  };

  const handleDeleteLead = (row: Lead) => {
    setDeletingLead(row);
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
      onClick: () => handleDeleteLead(row),
    },
  ];

  const handleExportCSV = async () => {
    try {
      const res = await fetch(buildUrl(1, 10000));
      const { data: rows } = await res.json();
      const list: Lead[] = rows ?? [];

      const headers = [
        "Lead ID", "Status", "First Name", "Last Name",
        "Email", "Phone", "Project", "Stage", "Next Action", "Inquiry Date",
      ];
      const csvRows = list.map((lead) => [
        lead.leadId,
        leadStatus[lead.status as keyof typeof leadStatus] || lead.status,
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.phone,
        lead.project,
        leadStage[lead.stage as keyof typeof leadStage] || lead.stage,
        leadNextAction[lead.nextAction as keyof typeof leadNextAction] || lead.nextAction,
        shortDateFormatter(lead.inquiryDate),
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

      toast.success(`Exported ${list.length} leads`);
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto scrollbar-hide border rounded-xl bg-background">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-xl">{table_name}</h3>
        </div>
        <TableSkeleton columnCount={visibleColumns.length} rowCount={10} recentViewOnly={recentViewOnly} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl bg-background animate-fade-in-up">
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

              <DropdownMenuSeparator />

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
            className="bg-blue-600 text-white hover:brightness-110"
            onClick={handleExportCSV}
          >
            <Download className="size-4 mr-2" />
            Export to CSV
          </Button>
        </span>
      </div>

      <Table>
        <TableHeader className="bg-accent">
          <TableRow>
            {visibleColumns.map((col, i) => (
              <TableHead
                key={i}
                className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-muted-foreground"
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {leadsData.map((row: Lead) => (
            <TableRow key={row.id} onClick={() => handleRowClick(row)} className="hover:bg-blue-600/10 cursor-pointer">
              <TableCell className="px-6 py-4 font-medium text-muted-foreground">
                {row.leadId}
              </TableCell>

              <TableCell className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${leadStatusMeta[row.status as keyof typeof leadStatus]?.className}`}>
                  {leadStatus[row.status as keyof typeof leadStatus]}
                </span>
              </TableCell>

              <TableCell className="px-6 py-4">{row.firstName} {row.lastName}</TableCell>

              <TableCell className="px-6 py-4">
                <span className="flex flex-col">
                  <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <PhoneIcon size={12} /> {row.phone}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MailIcon size={12} /> {row.email}
                  </span>
                </span>
              </TableCell>

              {!recentViewOnly && (
                <>
                  <TableCell className="px-6 py-4">{shortDateFormatter(row.inquiryDate)}</TableCell>
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

      {!recentViewOnly && (
        <div className="flex justify-between items-center bg-accent px-6 py-4 border-t">
          <p className="text-sm text-muted-foreground">
            {activeFilterCount > 0
              ? `${totalData} matching leads`
              : `${totalData} leads total`}
          </p>

          <div className="flex items-center gap-2">
            <TablePagination
              pageInfo={
                <span className="text-sm text-muted-foreground">
                  Showing {currentPage} of {totalPages} pages
                </span>
              }
              hidePreviousOnFirstPage
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              activeClassName="bg-blue-600 min-w-8"
            />
          </div>
        </div>
      )}

      <LeadDetailModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={() => {
          queryClient.invalidateQueries({ queryKey: qk.leads() });
        }}
      />

      <DeleteConfirmModal
        isOpen={deletingLead !== null}
        onClose={() => setDeletingLead(null)}
        onConfirm={() => deletingLead && deleteMutation.mutate(deletingLead.id)}
        itemName={deletingLead ? `${deletingLead.firstName} ${deletingLead.lastName}` : ""}
        isDeleting={deleteMutation.isPending}
        title="Delete Lead"
        confirmLabel="Delete Lead"
      />
    </div>
  );
}

export default LeadsTable;
