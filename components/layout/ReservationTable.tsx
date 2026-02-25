import React from "react";
import { Download, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { dateFormatter } from "@/app/utils/dateFormatter";

function ReservationTable() {
  const data = [
    {
      id: "1001",
      status: "Pending",
      name: "John Doe",
      phone: "0917 123 4567",
      email: "john@example.com",
      date: "2024-02-23",
      project: "Grand Oasis",
      block: "12",
      lot: "5",
    },
  ];

  return (
    <div className="overflow-x-auto border rounded-xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 border-b bg-white flex justify-between items-center">
        <h3 className="font-semibold text-xl">Reservation Table</h3>

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
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-gray-50 text-gray-600 border-b">
          <tr>
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
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  {row.status}
                </span>
              </td>
              <td className="px-6 py-4">{row.name}</td>
              <td className="px-6 py-4 text-gray-500">{row.phone}</td>
              <td className="px-6 py-4 text-gray-500">{row.email}</td>
              <td className="px-6 py-4">{dateFormatter(row.date)}</td>
              <td className="px-6 py-4">{row.project}</td>
              <td className="px-6 py-4">{row.block}</td>
              <td className="px-6 py-4">{row.lot}</td>
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

export default ReservationTable;
