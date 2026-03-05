"use client";
import {
  ArchiveX,
  ArrowLeft,
  ArrowRight,
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
import { useCallback, useEffect, useState } from "react";
import { inquirySource, inquiryStatus, inquirySubject } from "@/lib/types";
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

const ITEMS_PER_PAGE = 10;

function InquiryTable({
  table_name,
  recentViewOnly,
}: {
  table_name: string;
  recentViewOnly: boolean;
}) {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterSubject, setFilterSubject] = useState<string[]>([]);
  const [filterSource, setFilterSource] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");

  const activeFilterCount =
    filterStatus.length + filterSubject.length + filterSource.length;

  const buildUrl = useCallback(
    (page: number, limit = ITEMS_PER_PAGE) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort: sortOption,
      });
      if (filterStatus.length > 0) params.set("status", filterStatus.join(","));
      if (filterSubject.length > 0) params.set("subject", filterSubject.join(","));
      if (filterSource.length > 0) params.set("source", filterSource.join(","));
      return `/api/inquiries?${params}`;
    },
    [filterStatus, filterSubject, filterSource, sortOption],
  );

  const fetchInquiries = useCallback(async () => {
    try {
      const limit = recentViewOnly ? 5 : ITEMS_PER_PAGE;
      const response = await fetch(buildUrl(currentPage, limit));
      const { data, total: responseTotal } = await response.json();
      setInquiries(data ?? []);
      setTotal(responseTotal ?? 0);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setInquiries([]);
      setTotal(0);
    }
  }, [buildUrl, currentPage, recentViewOnly]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

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

  const updateInquiryStatus = async (id: number, newStatus: string) => {
    const response = await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) throw new Error("Failed to update status");
    return response.json();
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const previousInquiries = [...inquiries];
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq)),
    );
    try {
      await updateInquiryStatus(id, newStatus);
    } catch (error) {
      console.error("Status update failed:", error);
      setInquiries(previousInquiries);
    }
  };

  const handleRowClick = (row: any) => {
    setSelectedInquiry(row);
  };

  const statusStyles: Record<string, string> = {
    read: "bg-neutral-100 text-neutral-700 hover:bg-neutral-100",
    unread: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  };

  const totalPages = recentViewOnly ? 1 : Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const handleExportCSV = async () => {
    try {
      const response = await fetch(buildUrl(1, 10000));
      const { data } = await response.json();
      const rows: any[] = data ?? [];

      const headers = [
        "Client Name", "Email", "Phone", "Subject", "Message", "Source", "Status", "Date",
      ];
      const csvRows = rows.map((i) => [
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
      toast.success(`Exported ${rows.length} inquiries`);
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const actionMenu = (row: any) => [
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
      onClick: () => handleDeleteInquiry(row.id),
    },
  ];

  const handleDeleteInquiry = async (id: number) => {
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to delete inquiry");
      }
      toast.success("Inquiry deleted successfully");
      fetchInquiries();
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete inquiry");
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl bg-white animate-in slide-in-from-bottom-4 duration-500">
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
              {/* Sort */}
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

              {/* Subject */}
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

              {/* Source */}
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
            className="bg-blue-600 text-primary-foreground hover:brightness-110"
            onClick={handleExportCSV}
          >
            <Download className="size-4 mr-2" />
            Export to CSV
          </Button>
        </span>
      </div>

      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="hover:bg-transparent">
            {["Client Name", "Contact", "Subject", "Message", "Source", "Sent on", "Status", ""].map(
              (header) => (
                <TableHead
                  key={header}
                  className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-gray-600"
                >
                  {header}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {inquiries.map((row) => (
            <TableRow
              key={row.id}
              onClick={() => handleRowClick(row)}
              className={`hover:bg-blue-600/10 group transition-colors cursor-pointer ${
                row.status === "unread" ? "font-bold bg-blue-50/30" : ""
              }`}
            >
              <TableCell className="px-6 py-4">
                {row.firstName} {row.lastName}
              </TableCell>

              <TableCell className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm text-neutral-500 font-normal">
                    <PhoneIcon size={12} /> {row.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500 font-normal">
                    <MailIcon size={12} /> {row.email}
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap">
                {inquirySubject[row.subject as keyof typeof inquirySubject]}
              </TableCell>

              <TableCell className="px-6 py-4 max-w-[250px]">
                <p className="truncate text-gray-600 font-normal" title={row.message}>
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
                    statusStyles[row.status as keyof typeof statusStyles]
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
        <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
          <p className="text-sm text-gray-600">
            {activeFilterCount > 0
              ? `${total} matching inquiries`
              : `${total} inquiries total`}
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
      )}

      <InquiryDetailModal
        inquiry={selectedInquiry}
        isOpen={selectedInquiry !== null}
        onClose={() => setSelectedInquiry(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export default InquiryTable;
