"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Download,
  EllipsisVertical,
  ListFilter,
  Mail,
  MailIcon,
  Pencil,
  PhoneIcon,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { ReservationStatus, reservationStatus } from "@/lib/types";
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
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";
import { ReservationDetailModal } from "../../modal/crm/ReservationDetailModal";
import ContextMenu from "../../layout/ContextMenu";
import { toast } from "sonner";
import { shortDateFormatter } from "@/app/utils/shortDateFormatter";

type Reservation = {
  id: number;
  reservationId: string;
  status: ReservationStatus;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  createdAt: string;
  projectName: string;
  block: number;
  lot: number;
};

const statusStyles: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700",
  reserved: "bg-green-100 text-green-700",
  conditional: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-neutral-100 text-neutral-700",
  refunded: "bg-purple-100 text-purple-700",
};

const ITEMS_PER_PAGE = 10;

function ReservationTable({
  table_name,
  recentViewOnly,
}: {
  table_name: string;
  recentViewOnly: boolean;
}) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");

  const activeFilterCount = filterStatus.length;

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

  const handleRowClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleDeleteReservation = async (id: number) => {
    try {
      const response = await fetch(`/api/reservation/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete reservation");
      fetchReservations();
      toast.success("Reservation deleted successfully");
    } catch (error) {
      console.error("Error deleting reservation:", error);
      toast.error("Failed to delete reservation");
    }
  };

  const actionMenu = (row: Reservation) => [
    { label: "Send Email", icon: Mail, onClick: () => console.log("Sent!") },
    {
      label: "Edit Reservation",
      icon: Pencil,
      onClick: () => handleRowClick(row),
    },
    {
      label: "Delete",
      icon: Trash2,
      color: "text-red-600 focus:text-red-600 focus:bg-red-50",
      onClick: () => handleDeleteReservation(row.id),
    },
  ];

  const columns = [
    { label: "ID", key: "id" },
    { label: "Status", key: "status" },
    { label: "Client Name", key: "clientName" },
    { label: "Contact", key: "contact" },
    { label: "Project", key: "projectName" },
    { label: "Block No.", key: "block", hideOnRecent: true },
    { label: "Lot No.", key: "lot", hideOnRecent: true },
    { label: "Reserved", key: "createdAt", hideOnRecent: true },
    { label: "", key: "actions", hideOnRecent: true },
  ];

  const visibleColumns = useMemo(
    () =>
      recentViewOnly ? columns.filter((col) => !col.hideOnRecent) : columns,
    [recentViewOnly],
  );

  const buildUrl = useCallback(
    (page: number, limit = ITEMS_PER_PAGE) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort: sortOption,
      });
      if (filterStatus.length > 0) params.set("status", filterStatus.join(","));
      return `/api/reservation?${params}`;
    },
    [filterStatus, sortOption],
  );

  const fetchReservations = useCallback(async () => {
    try {
      const limit = recentViewOnly ? 3 : ITEMS_PER_PAGE;
      const response = await fetch(buildUrl(currentPage, limit));
      const { data, total: responseTotal } = await response.json();
      setReservations(data ?? []);
      setTotal(responseTotal ?? 0);
    } catch (error) {
      console.error("Error fetching reservation:", error);
      setReservations([]);
      setTotal(0);
    }
  }, [buildUrl, currentPage, recentViewOnly]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const totalPages = recentViewOnly
    ? 1
    : Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const handleExportCSV = async () => {
    try {
      const response = await fetch(buildUrl(1, 10000));
      const { data } = await response.json();
      const rows: Reservation[] = data ?? [];

      const headers = [
        "Reservation ID",
        "Status",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Project",
        "Block",
        "Lot",
        "Date Reserved",
      ];
      const csvRows = rows.map((r) => [
        r.reservationId,
        reservationStatus[r.status as keyof typeof reservationStatus] ||
          r.status,
        r.firstName,
        r.lastName,
        r.email,
        r.phone,
        r.projectName,
        r.block,
        r.lot,
        shortDateFormatter(r.createdAt),
      ]);
      const csvContent = [
        headers.join(","),
        ...csvRows.map((row) =>
          row
            .map((field) => `"${String(field).replace(/"/g, '""')}"`)
            .join(","),
        ),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Reservations_Export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${rows.length} reservations`);
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 border-b bg-white flex justify-between items-center">
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
                    onValueChange={(v) => {
                      setSortOption(v);
                      setCurrentPage(1);
                    }}
                  >
                    <DropdownMenuRadioItem value="newest">
                      Date: Newest first
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">
                      Date: Oldest first
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name_az">
                      Name: A → Z
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name_za">
                      Name: Z → A
                    </DropdownMenuRadioItem>
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
                  {Object.entries(reservationStatus).map(([key, label]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={filterStatus.includes(key)}
                      onCheckedChange={() =>
                        toggleFilter(key, filterStatus, setFilterStatus)
                      }
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
      <Table className="rounded-xl overflow-x-auto scrollbar-hide scroll-smooth">
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
          {reservations.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-blue-600/10 cursor-pointer"
              onClick={() => handleRowClick(row)}
            >
              <TableCell className="px-6 py-4 font-medium text-neutral-500">
                {row.reservationId}
              </TableCell>

              <TableCell className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[row.status]}`}
                >
                  {
                    reservationStatus[
                      row.status as keyof typeof reservationStatus
                    ]
                  }
                </span>
              </TableCell>

              <TableCell className="px-6 py-4">
                {row.firstName} {row.lastName}
              </TableCell>

              <TableCell className="px-6 py-4 text-gray-500">
                <span className="flex flex-col">
                  <span className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                    <PhoneIcon size={12} /> {row.phone}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-gray-500">
                    <MailIcon size={12} /> {row.email}
                  </span>
                </span>
              </TableCell>

              <TableCell className="px-6 py-4">{row.projectName}</TableCell>

              {!recentViewOnly && (
                <>
                  <TableCell className="px-6 py-4">{row.block}</TableCell>
                  <TableCell className="px-6 py-4">{row.lot}</TableCell>
                  <TableCell className="px-6 py-4">
                    {formatRelativeTime(row.createdAt)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
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
              ? `${total} matching reservations`
              : `${total} reservations total`}
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

      <ReservationDetailModal
        reservation={selectedReservation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={() => {
          fetchReservations();
        }}
      />
    </div>
  );
}

export default ReservationTable;
