import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { dateFormatter } from "@/app/utils/dateFormatter";
import { ReservationStatus, reservationStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    : reservations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="overflow-x-auto border rounded-xl animate-in slide-in-from-bottom-4 duration-500">
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
      <Table className="rounded-xl">
        <TableHeader className="bg-gray-50">
          <TableRow>
            {[
              "ID",
              "Status",
              "Client Name",
              "Phone",
              "Email",
              "Inquiry Date",
              "Project",
              "Block No.",
              "Lot No.",
              "",
            ].map((label, i) => (
              <TableHead
                key={i}
                className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-gray-600"
              >
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedReservations.map((row) => (
            <TableRow key={row.id} className="hover:bg-gray-50/50">
              <TableCell className="px-6 py-4 font-medium text-neutral-500">
                {row.reservationId}
              </TableCell>

              <TableCell className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[row.status]}`}
                >
                  {reservationStatus[row.status as keyof typeof reservationStatus]}
                </span>
              </TableCell>

              <TableCell className="px-6 py-4">
                {row.firstName} {row.lastName}
              </TableCell>

              <TableCell className="px-6 py-4 text-gray-500">{row.phone}</TableCell>

              <TableCell className="px-6 py-4 text-gray-500">{row.email}</TableCell>

              <TableCell className="px-6 py-4">{dateFormatter(row.createdAt)}</TableCell>

              <TableCell className="px-6 py-4">{row.projectName}</TableCell>

              <TableCell className="px-6 py-4">{row.block}</TableCell>

              <TableCell className="px-6 py-4">{row.lot}</TableCell>

              <TableCell className="px-6 py-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center gap-2 w-full px-2"
                >
                  <Pencil size={18} />
                  Edit
                </Button>
              </TableCell>
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  size="sm"
                  className={currentPage === pageNum ? "bg-blue-600" : ""}
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
        </div>
      )}
    </div>
  );
}

export default ReservationTable;