"use client";
import {
  ArchiveX,
  ArrowUpDown,
  Check,
  Download,
  EllipsisVertical,
  EyeIcon,
  ListFilter,
  Mail,
  MailIcon,
  MailOpen,
  PhoneIcon,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inquirySource, inquiryStatus, inquiryStatusMeta, inquirySubject } from "@/lib/types";
import { TablePagination } from "@/components/tables/TablePagination";
import { qk } from "@/lib/query-keys";
import { crmQueryOptions } from "@/lib/crm/crm-query-options";
import { buildInquiriesUrl, fetchInquiriesList } from "@/lib/crm/crm-fetchers";
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
} from "../../ui/dropdown-menu";
import ContextMenu from "../../layout/ContextMenu";
import { InquiryDetailModal } from "../../modal/crm/InquiryDetailModal";
import { toast } from "sonner";
import { shortDateFormatter } from "@/app/utils/shortDateFormatter";
import TableSkeleton from "@/components/layout/skeleton/TableSkeleton";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import { Inquiry } from "@/lib/types";
const ITEMS_PER_PAGE = 10;


function InquiryTable({
  table_name,
  recentViewOnly,
}: {
  table_name: string;
  recentViewOnly: boolean;
}) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deletingInquiry, setDeletingInquiry] = useState<Inquiry | null>(null);

  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterSubject, setFilterSubject] = useState<string[]>([]);
  const [filterSource, setFilterSource] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");

  const activeFilterCount =
    filterStatus.length + filterSubject.length + filterSource.length;

  const filters = {
    page: currentPage,
    limit: recentViewOnly ? 5 : ITEMS_PER_PAGE,
    sort: sortOption,
    status: filterStatus.join(","),
    subject: filterSubject.join(","),
    source: filterSource.join(","),
  };

  const { data, isLoading } = useQuery({
    queryKey: qk.inquiries(filters),
    queryFn: () => fetchInquiriesList(filters),
    ...crmQueryOptions,
  });

  const inquiries = (data?.data ?? []) as Inquiry[];
  const total = data?.total ?? 0;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to update status");
        return r.json();
      }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: qk.inquiries() });
      const previous = queryClient.getQueryData(qk.inquiries(filters));
      queryClient.setQueryData(qk.inquiries(filters), (old: { data: Inquiry[]; total: number } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((inq) => (inq.id === id ? { ...inq, status } : inq)),
        };
      });
      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(qk.inquiries(filters), ctx.previous);
      toast.error("Failed to update status");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.inquiries() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/inquiries/${id}`, { method: "DELETE" }).then((r) => {
        if (!r.ok) return r.json().then((err) => { throw new Error(err.error ?? "Failed to delete"); });
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.inquiries() });
      toast.success("Inquiry deleted successfully");
      setDeletingInquiry(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete inquiry");
    },
  });

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
    setFilterSubject([]);
    setFilterSource([]);
    setSortOption("newest");
    setCurrentPage(1);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleRowClick = (row: Inquiry) => {
    setSelectedInquiry(row);
  };

  const totalPages = recentViewOnly ? 1 : Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const handleExportCSV = async () => {
    try {
      const res = await fetch(
        buildInquiriesUrl({
          page: 1,
          limit: 100,
          sort: sortOption,
          status: filterStatus.join(","),
          subject: filterSubject.join(","),
          source: filterSource.join(","),
        }),
      );
      const { data: rows } = await res.json();
      const list: Inquiry[] = rows ?? [];

      const headers = [
        "Client Name", "Email", "Phone", "Subject", "Message", "Source", "Status", "Date",
      ];
      const csvRows = list.map((i) => [
        `${i.firstName} ${i.lastName}`,
        i.email,
        i.phone,
        inquirySubject[i.subject as keyof typeof inquirySubject] || i.subject,
        i.message,
        inquirySource[i.source as keyof typeof inquirySource] || i.source,
        inquiryStatus[i.status as keyof typeof inquiryStatus] || i.status,
        shortDateFormatter(i.createdAt),
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
      link.setAttribute("download", `Inquiries_Export_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${list.length} inquiries`);
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const actionMenu = (row: Inquiry) => [
    { label: "View Inquiry", icon: EyeIcon, onClick: () => handleRowClick(row) },
    {
      label: row.status === "read" ? "Mark as Unread" : "Mark as Read",
      icon: row.status === "read" ? Mail : MailOpen,
      onClick: () => handleStatusChange(row.id, row.status === "read" ? "unread" : "read"),
    },
    {
      label: "Mark as Spam",
      icon: ArchiveX,
      onClick: () => {},
    },
    {
      label: "Delete Inquiry",
      icon: Trash2,
      color: "text-red-600 focus:text-red-600 focus:bg-red-50",
      onClick: () => setDeletingInquiry(row),
    },
  ];

  if (isLoading) {
    return (
      <div className="overflow-x-auto scrollbar-hide border rounded-xl bg-background">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-xl">{table_name}</h3>
        </div>
        <TableSkeleton columnCount={8} rowCount={10} recentViewOnly={recentViewOnly} />
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

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-sm">
                  <ArrowUpDown className="size-3.5" /> Sort
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={sortOption}
                    onValueChange={(v) => { setSortOption(v); setCurrentPage(1); }}
                  >
                    <DropdownMenuRadioItem value="newest">Date: Newest first</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">Date: Oldest first</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name_az">Name: A → Z</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name_za">Name: Z → A</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

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
                  {Object.entries(inquiryStatus).map(([key, label]) => (
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

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-sm">
                  Subject
                  {filterSubject.length > 0 && (
                    <Badge className="ml-auto h-4 min-w-4 rounded-full bg-blue-600 px-1 text-[10px] text-white">
                      {filterSubject.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.entries(inquirySubject).map(([key, label]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={filterSubject.includes(key)}
                      onCheckedChange={() => toggleFilter(key, filterSubject, setFilterSubject)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 text-sm">
                  Source
                  {filterSource.length > 0 && (
                    <Badge className="ml-auto h-4 min-w-4 rounded-full bg-blue-600 px-1 text-[10px] text-white">
                      {filterSource.length}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.entries(inquirySource).map(([key, label]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={filterSource.includes(key)}
                      onCheckedChange={() => toggleFilter(key, filterSource, setFilterSource)}
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

      <Table>
        <TableHeader className="bg-accent">
          <TableRow className="hover:bg-transparent">
            {["Client Name", "Contact", "Subject", "Message", "Source", "Sent on", "Status", ""].map(
              (header) => (
                <TableHead
                  key={header}
                  className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-muted-foreground"
                >
                  {header}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {inquiries.map((row: Inquiry) => (
            <TableRow
              key={row.id}
              onClick={() => handleRowClick(row)}
              className={`hover:bg-blue-600/10 group transition-colors cursor-pointer ${
                row.status === "unread" ? "font-bold bg-accent" : ""
              }`}
            >
              <TableCell className="px-6 py-4">
                {row.firstName} {row.lastName}
              </TableCell>

              <TableCell className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-normal">
                    <PhoneIcon size={12} /> {row.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-normal">
                    <MailIcon size={12} /> {row.email}
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap">
                {inquirySubject[row.subject as keyof typeof inquirySubject]}
              </TableCell>

              <TableCell className="px-6 py-4 max-w-[250px]">
                <p className="truncate text-muted-foreground font-normal" title={row.message}>
                  {row.message}
                </p>
              </TableCell>

              <TableCell className="px-6 py-4 font-normal">
                {inquirySource[row.source as keyof typeof inquirySource]}
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap font-normal">
                {shortDateFormatter(row.createdAt)}
              </TableCell>

              <TableCell className="px-6 py-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-2 w-fit ${
                    inquiryStatusMeta[row.status as keyof typeof inquiryStatus]?.className
                  }`}
                >
                  {row.status === "read" ? (
                    <Check size={12} />
                  ) : (
                    <Mail size={12} className="animate-pulse" />
                  )}
                  {inquiryStatus[row.status as keyof typeof inquiryStatus]}
                </span>
              </TableCell>

              <TableCell className="px-6 py-4 text-right">
                <ContextMenu menu={actionMenu(row)} triggerIcon={EllipsisVertical} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!recentViewOnly && (
        <div className="flex items-center justify-between px-6 py-4 border-t bg-accent">
          <p className="text-sm text-muted-foreground">
            {activeFilterCount > 0
              ? `${total} matching inquiries`
              : `${total} inquiries total`}
          </p>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            activeClassName="bg-blue-600 min-w-8"
          />
        </div>
      )}

      <InquiryDetailModal
        inquiry={selectedInquiry ?? null}
        isOpen={selectedInquiry !== null}
        onClose={() => setSelectedInquiry(null)}
        onStatusChange={handleStatusChange}
      />

      <DeleteConfirmModal
        isOpen={deletingInquiry !== null}
        onClose={() => setDeletingInquiry(null)}
        onConfirm={() => deletingInquiry && deleteMutation.mutate(deletingInquiry.id)}
        itemName={deletingInquiry ? `${deletingInquiry.firstName} ${deletingInquiry.lastName}` : ""}
        isDeleting={deleteMutation.isPending}
        title="Delete Inquiry"
        confirmLabel="Delete Inquiry"
      />
    </div>
  );
}

export default InquiryTable;
