"use client";
import {
  Check,
  Download,
  EllipsisVertical,
  Mail,
  MailIcon,
  PhoneIcon,
  EyeIcon,
  Trash2,
  MailOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { dateFormatter } from "@/app/utils/dateFormatter";
import { useEffect, useState } from "react";
import {
  inquirySource,
  inquiryStatus,
  type InquiryStatus,
  type InquirySource,
  inquirySubject,
} from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { InquiryDetailModal } from "../modal/InquiryDetailModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

function InquiryTable({ table_name, recentViewOnly }: { table_name: string, recentViewOnly: boolean }) {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);

  const fetchInquiries = async () => {
    try {
      const response = await fetch("/api/inquiries");
      const { data } = await response.json();
      setInquiries(recentViewOnly ? data.slice(0, 5) : data);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setInquiries([]);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateInquiryStatus = async (id: number, newStatus: string) => {
    const response = await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to update status");
    }
    return response.json();
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    // Save previous state for rollback if needed
    const previousInquiries = [...inquiries];
  
    // OPTIMISTIC UPDATE: Change UI immediately
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
    );
  
    try {
      await updateInquiryStatus(id, newStatus);
      // Optional: Only fetch if you need updated 'updatedAt' timestamps from server
      // fetchInquiries(); 
    } catch (error) {
      console.error("Status update failed:", error);
      // ROLLBACK: Revert UI if API fails
      setInquiries(previousInquiries);
      // Trigger a Toast/Alert here to inform the user
    }
  };

  const handleDelete = (id: number) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    // Optional: Add API call here
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const statusStyles: Record<string, string> = {
    read: "bg-neutral-100 text-neutral-700 hover:bg-neutral-100",
    unread: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  };

  const handleRowClick = (row: any) => {
    setSelectedInquiry(row);
  };

  const handleActionMenuClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    row: any,
  ) => {
    e.stopPropagation();
    setShowActionMenu(true);
  };

  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl bg-white animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-xl">{table_name}</h3>
        <Button
          variant="default"
          size="sm"
          className="bg-blue-600 text-primary-foreground hover:brightness-110"
        >
          <Download className="size-4 mr-2" />
          Download Report
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="hover:bg-transparent">
            {[
              "Client Name",
              "Contact",
              "Subject",
              "Message",
              "Source",
              "Sent on",
              "Status",
              "",
            ].map((header) => (
              <TableHead
                key={header}
                className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-gray-600"
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {inquiries.map((row) => (
            <ContextMenu key={row.id}>
              <ContextMenuTrigger asChild>
                <TableRow
                  onClick={() => handleRowClick(row)}
                  className={`hover:bg-gray-50/50 group transition-colors cursor-pointer ${
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
                    <p
                      className="truncate text-gray-600 font-normal"
                      title={row.message}
                    >
                      {row.message}
                    </p>
                  </TableCell>

                  <TableCell className="px-6 py-4 font-normal">
                    {inquirySource[row.source as keyof typeof inquirySource]}
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap font-normal">
                    {dateFormatter(row.createdAt)}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionMenuClick(e, row);
                          }}
                        >
                          <EllipsisVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation(); // Stop bubble here too
                            handleRowClick(row);
                          }}
                          className="gap-2"
                        >
                          <EyeIcon size={14} /> View Inquiry
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(
                              row.id,
                              row.status === "read" ? "unread" : "read",
                            );
                          }}
                          className="gap-2"
                        >
                          {row.status === "read" ? (
                            <Mail size={14} />
                          ) : (
                            <MailOpen size={14} />
                          )}
                          Mark as {row.status === "read" ? "Unread" : "Read"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.id);
                          }}
                          className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 size={14} /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </ContextMenuTrigger>
            </ContextMenu>
          ))}
        </TableBody>
      </Table>

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
