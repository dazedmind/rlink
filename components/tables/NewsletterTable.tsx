import React, { useState } from "react";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";
import { dateFormatter } from "@/app/utils/dateFormatter";
import DropSelect from "../ui/DropSelect";
import TextInput from "../ui/TextInput";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- Types ---
type Subscriber = {
  id: number;
  name: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  joinedAt: string;
};

// --- Mock Data ---
const MOCK_SUBSCRIBERS: Subscriber[] = [
  { id: 1, name: "Alice Nguyen",  email: "alice@example.com",  status: "subscribed",   joinedAt: "2025-01-10" },
  { id: 2, name: "Marcus Bell",   email: "marcus@example.com", status: "subscribed",   joinedAt: "2025-02-03" },
  { id: 3, name: "Sofia Reyes",   email: "sofia@example.com",  status: "unsubscribed", joinedAt: "2024-11-22" },
  { id: 4, name: "James Okafor",  email: "james@example.com",  status: "subscribed",   joinedAt: "2025-01-28" },
  { id: 5, name: "Priya Shah",    email: "priya@example.com",  status: "unsubscribed", joinedAt: "2024-12-15" },
  { id: 6, name: "Lena Müller",   email: "lena@example.com",   status: "subscribed",   joinedAt: "2025-02-14" },
  { id: 7, name: "David Kim",     email: "david@example.com",  status: "subscribed",   joinedAt: "2025-03-01" },
];

// --- Status Badge ---
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    subscribed:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
    unsubscribed: "bg-slate-100 text-slate-500 border border-slate-200",
    sent:         "bg-blue-50 text-blue-700 border border-blue-200",
    scheduled:    "bg-amber-50 text-amber-700 border border-amber-200",
    draft:        "bg-slate-100 text-slate-600 border border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${styles[status] ?? ""}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

function NewsletterTable() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSubscribers = MOCK_SUBSCRIBERS.filter(
    (subscriber) => statusFilter === "all" || subscriber.status === statusFilter
  );

  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 border-b bg-white flex justify-between items-center">
        <h3 className="font-semibold text-xl">Subscribers List</h3>
        <span className="flex items-center gap-2 w-1/3">
          <TextInput
            label=""
            name="search"
            type="text"
            placeholder="Search"
            onChange={() => {""}}
            value={""}
            className="w-full"
          />
          <DropSelect
            label=""
            selectName="filter"
            selectId="filter-status"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">All</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </DropSelect>
        </span>
      </div>

      {/* shadcn/ui Table */}
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            {["", "Client Name", "Email", "Status", "Joined", ""].map(
              (label, i) => (
                <TableHead
                  key={i}
                  className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-gray-600"
                >
                  {label}
                </TableHead>
              )
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredSubscribers.map((row) => (
            <TableRow key={row.id} className="hover:bg-gray-50/50">
              <TableCell className="px-6 py-4 w-10">
                <input type="checkbox" className="rounded border-slate-300" />
              </TableCell>

              <TableCell className="px-6 py-4">{row.name}</TableCell>

              <TableCell className="px-6 py-4">{row.email}</TableCell>

              <TableCell className="px-6 py-4">
                <StatusBadge status={row.status} />
              </TableCell>

              <TableCell className="px-6 py-4">
                {dateFormatter(row.joinedAt)}
              </TableCell>

              <TableCell className="px-6 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 w-full px-2"
                >
                  <Eye size={18} />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default NewsletterTable;