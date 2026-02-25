"use client";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  ListFilter,
  MailIcon,
  Pencil,
  PhoneIcon,
} from "lucide-react";
import { dateFormatter } from "@/app/utils/dateFormatter";
import { useEffect, useState, useMemo } from "react";
import {
  leadStatus,
  type LeadStatus,
  leadNextAction,
  type LeadNextAction,
} from "@/lib/types";
import { leadStage, type LeadStage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

type Lead = {
  id: number;
  leadId: string;
  status: LeadStatus;
  clientName: string;
  phone: string;
  email: string;
  inquiryDate: string;
  project: string;
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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/leads");
      const { data } = await response.json();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeads([]);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(leads.length / itemsPerPage);

  const paginatedLeads = useMemo(() => {
    if (recentViewOnly) return leads.slice(0, 3);
    const startIndex = (currentPage - 1) * itemsPerPage;
    return leads.slice(startIndex, startIndex + itemsPerPage);
  }, [leads, currentPage, recentViewOnly]);

  const statusStyles: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    ongoing: "bg-purple-100 text-purple-700",
    follow_up: "bg-yellow-100 text-yellow-700",
    no_response: "bg-neutral-100 text-neutral-700",
    ineligible: "bg-neutral-100 text-neutral-700",
    won: "bg-green-100 text-green-700",
    lost: "bg-red-100 text-red-700",
  };

  return (
    <div className="overflow-x-auto border rounded-xl bg-white animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-xl">{table_name}</h3>

        <span className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ListFilter className="size-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Newest</DropdownMenuItem>
              <DropdownMenuItem>Oldest</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 text-primary-foreground hover:brightness-110"
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
            {[
              "Lead ID",
              "Status",
              "Client Name",
              "Contact",
              "Inquiry Date",
              "Last Update",
              "Stage",
              "Next Action",
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
          {paginatedLeads.map((row) => (
            <TableRow key={row.id} className="hover:bg-gray-50/50">
              <TableCell className="px-6 py-4 font-medium text-neutral-500">
                {row.leadId}
              </TableCell>

              <TableCell className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[row.status]}`}
                >
                  {leadStatus[row.status as keyof typeof leadStatus]}
                </span>
              </TableCell>

              <TableCell className="px-6 py-4">{row.clientName}</TableCell>

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

              <TableCell className="px-6 py-4">
                {dateFormatter(row.inquiryDate)}
              </TableCell>

              <TableCell className="px-6 py-4">
                {dateFormatter(row.updatedAt)}
              </TableCell>

              <TableCell className="px-6 py-4">
                {leadStage[row.stage as keyof typeof leadStage]}
              </TableCell>

              <TableCell className="px-6 py-4">
                {leadNextAction[row.nextAction as keyof typeof leadNextAction]}
              </TableCell>

              <TableCell className="px-6 py-4 text-right">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Pencil size={14} /> Edit
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
            Total {leads.length} leads found
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
                )
              )}
            </div>

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
      )}
    </div>
  );
}

export default LeadsTable;