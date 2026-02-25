"use client";
import React, { useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import NewsletterTable from "@/components/layout/NewsletterTable";

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
  status: "draft" | "sent";
  sentAt: string | null;
  openRate: number | null;
  clickRate: number | null;
  recipients: number;
};

// --- Mock Data ---
const MOCK_SUBSCRIBERS: Subscriber[] = [
  { id: 1, name: "Alice Nguyen", email: "alice@example.com", status: "subscribed", joinedAt: "2025-01-10" },
  { id: 2, name: "Marcus Bell", email: "marcus@example.com", status: "subscribed", joinedAt: "2025-02-03" },
  { id: 3, name: "Sofia Reyes", email: "sofia@example.com", status: "unsubscribed", joinedAt: "2024-11-22" },
  { id: 4, name: "James Okafor", email: "james@example.com", status: "subscribed", joinedAt: "2025-01-28" },
  { id: 5, name: "Priya Shah", email: "priya@example.com", status: "unsubscribed", joinedAt: "2024-12-15" },
  { id: 6, name: "Lena Müller", email: "lena@example.com", status: "subscribed", joinedAt: "2025-02-14" },
  { id: 7, name: "David Kim", email: "david@example.com", status: "subscribed", joinedAt: "2025-03-01" },
];

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 1, name: "March Launch Announcement", subject: "🚀 Something big is here", status: "sent", sentAt: "2025-03-05", openRate: 62.4, clickRate: 18.1, recipients: 1240 },
  { id: 2, name: "Weekly Digest #12", subject: "Your weekly roundup", status: "sent", sentAt: "2025-02-28", openRate: 48.7, clickRate: 9.3, recipients: 1198 },
  { id: 3, name: "April Product Update", subject: "What's new this April", status: "draft", sentAt: null, openRate: null, clickRate: null, recipients: 0 },
  { id: 4, name: "Summer Sale Teaser", subject: "☀️ Something exciting coming...", status: "draft", sentAt: null, openRate: null, clickRate: null, recipients: 0 },
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${styles[status] ?? ""}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// --- Campaign Context Menu ---
const CampaignMenu = ({ onClose, onAction }: { onClose: () => void; onAction: (action: string) => void }) => {
  const items = [
    { label: "Send Now", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />, color: "text-slate-700" },
    { label: "View", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />, color: "text-slate-700" },
    { label: "Edit", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h18" />, color: "text-slate-700" },
    { label: "Delete", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />, color: "text-red-500" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 top-8 z-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-44 overflow-hidden">
        {items.map(item => (
          <button
            key={item.label}
            onClick={() => { onAction(item.label); onClose(); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm ${item.color} hover:bg-slate-50 transition-colors text-left ${item.label === "Delete" ? "border-t border-slate-100 mt-1" : ""}`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
};

// --- Compose Modal ---
const ComposeModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({ subject: "", preview: "", body: "" });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900">New Campaign</h2>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Subject Line</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Enter email subject..."
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Preview Text</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Short preview shown in inbox..."
              value={form.preview}
              onChange={e => setForm(f => ({ ...f, preview: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Body</label>
            <textarea
              rows={6}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
              placeholder="Write your email content here..."
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              Save as Draft
            </Button>
            <Button variant="default">
              Send Campaign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
function Newsletter() {
  const [activeTab, setActiveTab] = useState<"subscribers" | "campaigns">("subscribers");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCompose, setShowCompose] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const filteredSubscribers = MOCK_SUBSCRIBERS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    setSelectedIds(selectedIds.length === filteredSubscribers.length ? [] : filteredSubscribers.map(s => s.id));
  };

  const stats = [
    { label: "Total Subscribers", value: MOCK_SUBSCRIBERS.filter(s => s.status === "subscribed").length, sub: "subscribed", color: "text-emerald-600" },
    { label: "Campaigns Sent", value: MOCK_CAMPAIGNS.filter(c => c.status === "sent").length, sub: "this quarter", color: "text-blue-600" },
    { label: "Avg. Open Rate", value: "55.6%", sub: "last 30 days", color: "text-primary" },
    { label: "Unsubscribers", value: MOCK_SUBSCRIBERS.filter(s => s.status === "unsubscribed").length, sub: "total", color: "text-slate-500" },
  ];

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}

      <div className="mx-auto p-8">
        <DashboardHeader
          title="Newsletter"
          description="Manage your newsletter subscribers and campaigns."
        />

        <div className="flex flex-col gap-8">

          {/* Stats Row */}

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="flex flex-col justify-end h-[150px]">
                <CardContent className="flex flex-col items-start">
                  <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-muted-foreground">{stat.label}</p>
                    {/* {stat.hasIncrease && <p className="flex items-center text-xs text-green-600"><FaCaretUp className="size-4 text-green-600" /> +12%</p>} */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>


          {/* Tab Bar + Actions */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
              {(["subscribers", "campaigns"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {activeTab === "subscribers" && (
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export CSV
                </button>
              )}
              <button
                onClick={() => setShowCompose(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Campaign
              </button>
            </div>
          </div>

          {/* Subscribers Tab */}
          {activeTab === "subscribers" && (
            <NewsletterTable />
          )}

          {/* Campaigns Tab */}
          {activeTab === "campaigns" && (
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-left font-medium">Campaign</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Recipients</th>
                      <th className="px-4 py-3 text-left font-medium">Open Rate</th>
                      <th className="px-4 py-3 text-left font-medium">Click Rate</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {MOCK_CAMPAIGNS.map(campaign => (
                      <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">{campaign.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{campaign.subject}</p>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={campaign.status} /></td>
                        <td className="px-4 py-3 text-slate-600">{campaign.recipients > 0 ? campaign.recipients.toLocaleString() : "—"}</td>
                        <td className="px-4 py-3">
                          {campaign.openRate !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${campaign.openRate}%` }} />
                              </div>
                              <span className="text-slate-700 font-medium">{campaign.openRate}%</span>
                            </div>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {campaign.clickRate !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${campaign.clickRate * 4}%` }} />
                              </div>
                              <span className="text-slate-700 font-medium">{campaign.clickRate}%</span>
                            </div>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{campaign.sentAt ?? "—"}</td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                              </svg>
                            </button>
                            {openMenuId === campaign.id && (
                              <CampaignMenu
                                onClose={() => setOpenMenuId(null)}
                                onAction={(action) => console.log(action, campaign.id)}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-400">{MOCK_CAMPAIGNS.length} campaigns total</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

export default Newsletter;