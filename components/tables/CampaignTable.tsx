import React, { useState } from "react";
import { Button } from "../ui/button";
import { MoreHorizontal, Send, Eye, Pencil, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Types ---
type Campaign = {
  id: number;
  name: string;
  subject: string;
  status: "draft" | "sent";
  sentAt: string;
  openRate: number;
  clickRate: number;
  recipients: number;
};

// --- Mock Data ---
const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 1, name: "March Launch Announcement", subject: "🚀 Something big is here",       status: "sent",  sentAt: "2025-03-05", openRate: 62.4, clickRate: 18.1, recipients: 1240 },
  { id: 2, name: "Weekly Digest #12",         subject: "Your weekly roundup",              status: "sent",  sentAt: "2025-02-28", openRate: 48.7, clickRate: 9.3,  recipients: 1198 },
  { id: 3, name: "April Product Update",      subject: "What's new this April",            status: "draft", sentAt: "2025-04-01", openRate: 0,    clickRate: 0,    recipients: 0    },
  { id: 4, name: "Summer Sale Teaser",        subject: "☀️ Something exciting coming...", status: "draft", sentAt: "2025-06-01", openRate: 0,    clickRate: 0,    recipients: 0    },
];

// --- Status Badge ---
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600 border border-slate-200",
    sent:  "bg-blue-50 text-blue-700 border border-blue-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${styles[status] ?? ""}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// --- Action Menu ---
const ActionMenu = ({ status }: { status: "draft" | "sent" }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <MoreHorizontal size={16} />
        <span className="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {status === "draft" && (
        <>
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <Send size={14} /> Send Now
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItem className="gap-2 cursor-pointer">
        <Eye size={14} /> View
      </DropdownMenuItem>
      <DropdownMenuItem className="gap-2 cursor-pointer">
        <Pencil size={14} /> Edit
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 focus:text-red-600">
        <Trash2 size={14} /> Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

function CampaignTable() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCampaigns = MOCK_CAMPAIGNS.filter(
    (campaign) => statusFilter === "all" || campaign.status === statusFilter
  );

  return (
    <div className="overflow-x-auto scrollbar-hide border rounded-xl animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 border-b bg-white flex justify-between items-center">
        <h3 className="font-semibold text-xl">Campaigns List</h3>
        <span className="flex items-center gap-2 w-1/3">
          <TextInput
            name="search"
            type="text"
            placeholder="Search"
            onChange={() => {""}}
            value={""}
            className="w-full"
          />
          <DropSelect
            selectName="filter"
            selectId="filter-status"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
          </DropSelect>
        </span>
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            {["Campaign", "Status", "Recipients", "Open Rate", "Click Rate", "Date", ""].map(
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
          {filteredCampaigns.map((row) => (
            <TableRow key={row.id} className="hover:bg-gray-50/50">
              <TableCell className="px-6 py-4">
                <p className="font-medium text-sm">{row.name}</p>
                <p className="text-xs text-gray-500">{row.subject}</p>
              </TableCell>

              <TableCell className="px-6 py-4">
                <StatusBadge status={row.status} />
              </TableCell>

              <TableCell className="px-6 py-4">
                {row.recipients || "—"}
              </TableCell>

              <TableCell className="px-6 py-4 min-w-[100px]">
                <span className="text-sm">{row.openRate ? `${row.openRate}%` : "—"}</span>
                <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${row.openRate}%` }}
                  />
                </div>
              </TableCell>

              <TableCell className="px-6 py-4 min-w-[100px]">
                <span className="text-sm">{row.clickRate ? `${row.clickRate}%` : "—"}</span>
                <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${row.clickRate}%` }}
                  />
                </div>
              </TableCell>

              <TableCell className="px-6 py-4">
                {dateFormatter(row.sentAt)}
              </TableCell>

              <TableCell className="px-6 py-4 text-right">
                <ActionMenu status={row.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default CampaignTable;