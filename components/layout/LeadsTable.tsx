"use client";
import { Download, MailIcon, Pencil, PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dateFormatter } from "@/app/utils/dateFormatter";

function LeadsTable({ table_name }: { table_name: string }) {
  // Mock data based on your specific columns
  const data = [
    {
      id: "LD-8201",
      status: "Active",
      clientName: "Juan Dela Cruz",
      phone: "+63 917 123 4567",
      email: "juan.dc@example.com",
      date: "2026-02-20",
      lastUpdate: "2026-02-20",
      stage: "Negotiation",
      nextAction: "Send contract draft",
    },
    {
      id: "LD-8202",
      status: "New",
      clientName: "Maria Santos",
      phone: "+63 918 987 6543",
      email: "m.santos@company.ph",
      date: "2026-02-20",
      lastUpdate: "2026-02-20",
      stage: "Initial Contact",
      nextAction: "Schedule site visit",
    },
    {
      id: "LD-8203",
      status: "Pending",
      clientName: "Robert Lim",
      phone: "+63 915 555 1234",
      email: "robert.lim@web.com",
      date: "2026-02-20",
      lastUpdate: "2026-02-20",
      stage: "Follow-up",
      nextAction: "Wait for client call",
    },
  ];

  const statusStyles: Record<string, string> = {
    New: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    Active: "bg-green-100 text-green-700 hover:bg-green-100",
    Pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
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
              "ID",
              "Status",
              "Client Name",
              "Contact",
              "Inquiry Date",
              "Last Update",
              "Stage",
              "Next Action",
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
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50/50">
              <td className="px-6 py-4 font-medium text-neutral-500">
                {row.id}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 ${statusStyles[row.status]} rounded-full text-xs font-medium`}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-6 py-4">{row.clientName}</td>
              <td className="px-6 py-4">
                <span className="flex flex-col">
                  <span className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                    <PhoneIcon size={12} /> {row.phone}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-gray-500">
                    <MailIcon size={12} /> {row.email}
                  </span>
                </span>
              </td>
              {/* <td className="px-6 py-4 text-gray-500">{row.email}</td> */}
              <td className="px-6 py-4">{dateFormatter(row.date)}</td>
              <td className="px-6 py-4">{dateFormatter(row.lastUpdate)}</td>
              <td className="px-6 py-4">{row.stage}</td>
              <td className="px-6 py-4">{row.nextAction}</td>
              <td className="px-6 py-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center gap-2 w-full px-2"
                >
                  <Pencil size={18} />
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeadsTable;
