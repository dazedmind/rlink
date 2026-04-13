"use client";
import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
import { ReservationStatus, reservationStatus, reservationStatusMeta } from "@/lib/types";
import { qk } from "@/lib/query-keys";
import { crmQueryOptions } from "@/lib/crm/crm-query-options";
import { buildReservationsUrl, fetchReservationsList } from "@/lib/crm/crm-fetchers";
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
import TableSkeleton from "@/components/layout/skeleton/TableSkeleton";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import { TablePagination } from "@/components/tables/TablePagination";

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

const ITEMS_PER_PAGE = 10;

function ReservationTable({
  table_name,
  recentViewOnly,
}: {
  table_name: string;
  recentViewOnly: boolean;
}) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingReservation, setDeletingReservation] = useState<Reservation | null>(null);

  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");

  const activeFilterCount = filterStatus.length;

  const filters = {
    page: currentPage,
    limit: recentViewOnly ? 3 : ITEMS_PER_PAGE,
    sort: sortOption,
    status: filterStatus.join(","),
  };

  const { data, isLoading } = useQuery({
    queryKey: qk.reservations(filters),
    queryFn: () => fetchReservationsList(filters),
    ...crmQueryOptions,
  });

  const reservations = (data?.data ?? []) as Reservation[];
  const total = data?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/reservation/${id}`, { method: "DELETE" }).then((r) => {
        if (!r.ok) throw new Error("Failed to delete reservation");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.reservations() });
      toast.success("Reservation deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete reservation");
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
    setSortOption("newest");
    setCurrentPage(1);
  };

  const handleRowClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleDeleteReservation = (row: Reservation) => {
    setDeletingReservation(row);
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
      onClick: () => handleDeleteReservation(row),
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

  const totalPages = recentViewOnly
    ? 1
    : Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const handleExportCSV = async () => {
    try {
      const res = await fetch(
        buildReservationsUrl({
          page: 1,
          limit: 100,
          sort: sortOption,
          status: filterStatus.join(","),
        }),
      );
      const { data: rows } = await res.json();
      const list: Reservation[] = rows ?? [];

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
      const csvRows = list.map((r) => [
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
      toast.success(`Exported ${list.length} reservations`);
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto scrollbar-hide border rounded-xl">
        <div className="p-4 border-b bg-background">
          <h3 className="font-semibold text-xl">{table_name}</h3>
        </div>
        <TableSkeleton columnCount={visibleColumns.length} rowCount={10} recentViewOnly={recentViewOnly} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl animate-fade-in-up">
      <div className="p-4 border-b bg-background flex justify-between items-center">
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

      <Table className="rounded-xl overflow-x-auto scrollbar-hide scroll-smooth">
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
          {reservations.map((row: Reservation) => (
            <TableRow
              key={row.id}
              className="hover:bg-blue-600/10 cursor-pointer"
              onClick={() => handleRowClick(row)}
            >
              <TableCell className="px-6 py-4 font-medium text-muted-foreground">
                {row.reservationId}
              </TableCell>

              <TableCell className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${reservationStatusMeta[row.status as keyof typeof reservationStatus]?.className}`}
                >
                  {
                    reservationStatusMeta[row.status as keyof typeof reservationStatus]?.label
                  }
                </span>
              </TableCell>

              <TableCell className="px-6 py-4">
                {row.firstName} {row.lastName}
              </TableCell>

              <TableCell className="px-6 py-4 text-muted-foreground">
                <span className="flex flex-col">
                  <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <PhoneIcon size={12} /> {row.phone}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
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

      {!recentViewOnly && (
        <div className="flex justify-between items-center bg-accent px-6 py-4 border-t">
          <p className="text-sm text-muted-foreground">
            {activeFilterCount > 0
              ? `${total} matching reservations`
              : `${total} reservations total`}
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

      <ReservationDetailModal
        reservation={selectedReservation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={() => {
          queryClient.invalidateQueries({ queryKey: qk.reservations() });
        }}
      />

      <DeleteConfirmModal
        isOpen={deletingReservation !== null}
        onClose={() => setDeletingReservation(null)}
        onConfirm={() => {
          if (!deletingReservation) return;
          const id = deletingReservation.id;
          setDeletingReservation(null);
          deleteMutation.mutate(id);
        }}
        itemName={deletingReservation ? `${deletingReservation.reservationId}` : ""}
        title="Delete Reservation"
        confirmLabel="Delete Reservation"
      />
    </div>
  );
}

export default ReservationTable;
