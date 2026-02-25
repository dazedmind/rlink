import React, { useState } from "react";
import { Button } from "../ui/button";
import { Download, Pencil } from "lucide-react";
import { dateFormatter } from "@/app/utils/dateFormatter";
import DropSelect from "../ui/DropSelect";
import TextInput from "../ui/TextInput";

function NewsletterTable() {
  const [statusFilter, setStatusFilter] = useState("all");
  // --- Types ---
  type Subscriber = {
    id: number;
    name: string;
    email: string;
    status: "subscribed" | "unsubscribed";
    joinedAt: string;
  };

  type Campaign = {
    id: number;
    name: string;
    subject: string;
    status: "sent" | "draft";
    sentAt: string | null;
    openRate: number | null;
    clickRate: number | null;
    recipients: number;
  };

  // --- Mock Data ---
  const MOCK_SUBSCRIBERS: Subscriber[] = [
    {
      id: 1,
      name: "Alice Nguyen",
      email: "alice@example.com",
      status: "subscribed",
      joinedAt: "2025-01-10",
    },
    {
      id: 2,
      name: "Marcus Bell",
      email: "marcus@example.com",
      status: "subscribed",
      joinedAt: "2025-02-03",
    },
    {
      id: 3,
      name: "Sofia Reyes",
      email: "sofia@example.com",
      status: "unsubscribed",
      joinedAt: "2024-11-22",
    },
    {
      id: 4,
      name: "James Okafor",
      email: "james@example.com",
      status: "subscribed",
      joinedAt: "2025-01-28",
    },
    {
      id: 5,
      name: "Priya Shah",
      email: "priya@example.com",
      status: "unsubscribed",
      joinedAt: "2024-12-15",
    },
    {
      id: 6,
      name: "Lena Müller",
      email: "lena@example.com",
      status: "subscribed",
      joinedAt: "2025-02-14",
    },
    {
      id: 7,
      name: "David Kim",
      email: "david@example.com",
      status: "subscribed",
      joinedAt: "2025-03-01",
    },
  ];

  const MOCK_CAMPAIGNS: Campaign[] = [
    {
      id: 1,
      name: "March Launch Announcement",
      subject: "🚀 Something big is here",
      status: "sent",
      sentAt: "2025-03-05",
      openRate: 62.4,
      clickRate: 18.1,
      recipients: 1240,
    },
    {
      id: 2,
      name: "Weekly Digest #12",
      subject: "Your weekly roundup",
      status: "sent",
      sentAt: "2025-02-28",
      openRate: 48.7,
      clickRate: 9.3,
      recipients: 1198,
    },
    {
      id: 3,
      name: "April Product Update",
      subject: "What's new this April",
      status: "draft",
      sentAt: null,
      openRate: null,
      clickRate: null,
      recipients: 0,
    },
    {
      id: 4,
      name: "Summer Sale Teaser",
      subject: "☀️ Something exciting coming...",
      status: "draft",
      sentAt: null,
      openRate: null,
      clickRate: null,
      recipients: 0,
    },
  ];

  // --- Status Badge ---
  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      subscribed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      unsubscribed: "bg-slate-100 text-slate-500 border border-slate-200",
      sent: "bg-blue-50 text-blue-700 border border-blue-200",
      scheduled: "bg-amber-50 text-amber-700 border border-amber-200",
      draft: "bg-slate-100 text-slate-600 border border-slate-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${styles[status] ?? ""}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto border rounded-xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 border-b bg-white flex justify-between items-center">
        <h3 className="font-semibold text-xl">Subscribers List</h3>
        <span className="flex items-center gap-2 w-1/3">
          <TextInput 
            hasLabel={false}
            label=""
            type="text"
            placeholder="Search"
          />
          <DropSelect
            hasLabel={false}
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
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-gray-50 text-gray-600 border-b">
          <tr>
            {[
              { key: "select",      label: "" },
              { key: "name",        label: "Client Name" },
              { key: "email",       label: "Email" },
              { key: "status",      label: "Status" },
              { key: "joined",      label: "Joined" },
              { key: "actions",     label: "" },
            ].map((h) => (
              <th
                key={h.key}
                className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider"
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {MOCK_SUBSCRIBERS.filter(
            (subscriber) =>
              statusFilter === "all" || subscriber.status === statusFilter,
          ).map((row) => (
            <tr key={row.id} className="hover:bg-gray-50/50">
              <td className="px-6 py-4 font-medium text-neutral-500 w-10">
                <input type="checkbox" className="rounded border-slate-300" />
              </td>
              <td className="px-6 py-4">{row.name}</td>
              <td className="px-6 py-4">{row.email}</td>
              <td className="px-6 py-4">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-6 py-4">{dateFormatter(row.joinedAt)}</td>
              <td className="px-6 py-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center gap-2 w-full px-2"
                >
                  <Pencil size={18} />
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

export default NewsletterTable;
