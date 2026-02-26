"use client";
import React, { useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NewsletterTable from "@/components/tables/NewsletterTable";
import CampaignTable from "@/components/tables/CampaignTable";
import ComposerModal from "@/components/layout/ComposerModal";

// --- Main Component ---
function Newsletter() {
  const [activeTab, setActiveTab] = useState<"subscribers" | "campaigns">("subscribers");
  const [search, setSearch] = useState("");
  const [showCompose, setShowCompose] = useState(false);


  const stats = [
    { label: "Total Subscribers", value:"5", sub: "subscribed", color: "text-emerald-600" },
    { label: "Campaigns Sent", value: "100", sub: "this quarter", color: "text-blue-600" },
    { label: "Avg. Open Rate", value: "55.6%", sub: "last 30 days", color: "text-primary" },
    { label: "Unsubscribers", value: "0", sub: "total", color: "text-slate-500" },
  ];

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      {showCompose && <ComposerModal onClose={() => setShowCompose(false)} />}

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
            <CampaignTable />
          )}
        </div>
      </div>
    </main>
  );
}

export default Newsletter;