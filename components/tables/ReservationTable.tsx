import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  MailIcon,
  PhoneIcon,
  Pencil,
  EllipsisVertical,
  Trash2,
  Send,
  Mail,
} from "lucide-react";
import { Button } from "../ui/button";
import { ReservationStatus, reservationStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";
import { ReservationDetailModal } from "../modal/ReservationDetailModal";
import ContextMenu from "../layout/ContextMenu";
import { toast } from "sonner";

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

function ReservationTable({
  table_name,
  recentViewOnly,
}: {
  table_name: string;
  recentViewOnly: boolean;
}) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleDeleteReservation = async (id: number) => {
    try {
      const response = await fetch(`/api/reservation/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete reservation");
      }
      fetchReservations();
      toast.success("Reservation deleted successfully");
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  };

  const menuItems = (row: Reservation) => [
    {
      label: "Send Email",
      icon: Mail,
      onClick: () => console.log("Sent!"),
    },
    {
      label: "Edit",
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

  // 1. Define your Column Configuration
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

  // 2. Filter columns based on the prop
  const visibleColumns = useMemo(() => {
    return recentViewOnly
      ? columns.filter((col) => !col.hideOnRecent)
      : columns;
  }, [recentViewOnly]);

  const fetchReservations = async () => {
    try {
      const response = await fetch("/api/reservation");
      const { data } = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservation:", error);
      setReservations([]);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(reservations.length / itemsPerPage);
  const paginatedReservations = recentViewOnly
    ? reservations.slice(0, 3)
    : reservations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      );

  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 border-b bg-white flex justify-between items-center ">
        <h3 className="font-semibold text-xl">{table_name}</h3>
        <span>
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 text-primary-foreground hover:brightness-110"
          >
            <Download className="size-4" />
            Export to CSV
          </Button>
        </span>
      </div>

      {/* shadcn/ui Table */}
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
          {paginatedReservations.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-gray-50/50 cursor-pointer"
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

              {/* Conditional Data Cells */}
              {!recentViewOnly && (
                <>
                  <TableCell className="px-6 py-4">{row.block}</TableCell>
                  <TableCell className="px-6 py-4">{row.lot}</TableCell>
                  <TableCell className="px-6 py-4">
                    {formatRelativeTime(row.createdAt)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <ContextMenu
                      menu={menuItems(row)}
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
            Total {reservations.length} reservations found
          </p>

          <div className="flex items-center gap-2">
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

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {currentPage} of {totalPages} pages
              </span>
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
