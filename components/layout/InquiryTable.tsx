"use client";
import {
  Check,
  Circle,
  Download,
  EyeIcon,
  Mail,
  MailIcon,
  Pencil,
  PhoneIcon,
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

function InquiryTable({ table_name }: { table_name: string }) {
  // Mock data based on your specific columns
  const [inquiries, setInquiries] = useState<any[]>([]);

  const fetchInquiries = async () => {
    try {
      const response = await fetch("/api/inquiries");
      const { data } = await response.json();
      setInquiries(data);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setInquiries([]);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const statusStyles: Record<string, string> = {
    read: "bg-neutral-100 text-neutral-700 hover:bg-neutral-100",
    unread: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  };

  return (
    <div className="overflow-x-auto border rounded-xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 border-b bg-white flex justify-between items-center">
        <h3 className="font-semibold text-xl">{table_name}</h3>
        <Button
          variant="default"
          size="sm"
          className="bg-blue-600 text-primary-foreground hover:brightness-110"
        >
          <Download className="size-4" />
          Download Report
        </Button>
      </div>
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-gray-50 text-gray-600 border-b">
          <tr>
            {[
              "Client Name",
              "Contact",
              "Subject",
              "Message",
              "Source",
              "Sent on",
              "Status",
              "",
            ].map((h) => (
              <th
                key={h}
                className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {inquiries.map((row) => (
            <tr
              key={row.id}
              className={`hover:bg-gray-50/50 ${row.status === "read" ? "" : " font-bold"}`}
            >
              <td className="px-6 py-4">
                {row.firstName} {row.lastName}
              </td>
              <td className="px-6 py-4">
                <span className="flex flex-col">
                  <span className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                    <PhoneIcon size={12} /> {row.phone}
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                    <MailIcon size={12} /> {row.email}
                  </span>
                </span>
              </td>
              <td className="px-6 py-4">
                {inquirySubject[row.subject as keyof typeof inquirySubject]}
              </td>
              <td className="px-6 py-4">{row.message}</td>
              <td className="px-6 py-4">
                {inquirySource[row.source as keyof typeof inquirySource]}
              </td>
              <td className="px-6 py-4">{dateFormatter(row.createdAt)}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 ${statusStyles[row.status]} rounded-full text-xs font-medium flex items-center gap-2 w-fit`}
                >
                  {row.status === "read" ? (
                    <Check size={12} />
                  ) : (
                    <Mail size={12} />
                  )}
                  {inquiryStatus[row.status as keyof typeof inquiryStatus]}
                </span>
              </td>
              <td className="px-6 py-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center gap-2 w-full px-2"
                >
                  <EyeIcon size={18} />
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InquiryTable;
