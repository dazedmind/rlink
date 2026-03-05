"use client";
import React, { useCallback, useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NewsletterTable from "@/components/tables/crm/NewsletterTable";
import CampaignTable from "@/components/tables/crm/CampaignTable";
import ComposerModal from "@/components/modal/crm/ComposerModal";
import { Megaphone, PlusCircle, User } from "lucide-react";

type Campaign = {
  id: number;
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sent";
  sentAt: string;
  createdAt: string;
};

// --- Main Component ---
function Newsletter() {
  const [activeTab, setActiveTab] = useState<"subscribers" | "campaigns">("subscribers");
  const [showCompose, setShowCompose] = useState(false);
  const [composerMode, setComposerMode] = useState<"create" | "view" | "edit">("create");
  const [composerCampaign, setComposerCampaign] = useState<{ id: number; name: string; subject: string; previewLine?: string; body?: string } | null>(null);
  const [campaignRefreshKey, setCampaignRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [totalUnsubscribers, setTotalUnsubscribers] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [totalSentCampaigns, setTotalSentCampaigns] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const stats = [
    { label: "Total Subscribers", value: totalSubscribers, color: "text-emerald-600" },
    { label: "Campaigns Sent", value: totalSentCampaigns, color: "text-blue-600" },
    { label: "Avg. Open Rate", value: "55.6%", color: "text-primary" },
    { label: "Unsubscribers", value: totalUnsubscribers, color: "text-slate-500" },
  ];

  // Build API URL for stats (limit=1 to minimize payload; we only need totalSubscribed/totalUnsubscribed)
  const buildStatsUrl = useCallback(() => {
    const params = new URLSearchParams({ page: "1", limit: "1" });
    return `/api/newsletter/subscriptions?${params}`;
  }, []);

  const fetchSubscriberStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(buildStatsUrl());
      const { totalSubscribed, totalUnsubscribed } = await response.json();
      setTotalSubscribers(totalSubscribed ?? 0);
      setTotalUnsubscribers(totalUnsubscribed ?? 0);
    } catch (error) {
      console.error("Error fetching subscriber stats:", error);
      setTotalSubscribers(0);
      setTotalUnsubscribers(0);
    } finally {
      setIsLoading(false);
    }
  }, [buildStatsUrl]);

    // Build API URL from current state
    const buildCampaignUrl = useCallback(() => {
      const params = new URLSearchParams({ page: "1", limit: "1" });
      return `/api/newsletter/campaigns?${params}`;
    }, []);
    
    const fetchCampaigns = useCallback(async (page: number) => {
      setIsLoading(true);
      try {
        const response = await fetch(buildCampaignUrl(), { credentials: "include" });
        const { data, totalSent: responseTotalSent } = await response.json();
        setCampaigns(data ?? []);
        setTotalSentCampaigns(responseTotalSent ?? 0);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setCampaigns([]);
        setTotalSentCampaigns(0);
      } finally {
        setIsLoading(false);
      }
    }, [buildCampaignUrl]);
  
  useEffect(() => {
    fetchSubscriberStats();
    fetchCampaigns(currentPage);
  }, [fetchSubscriberStats, fetchCampaigns, currentPage]);

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      {showCompose && (
        <ComposerModal
          isOpen={showCompose}
          onClose={() => { setShowCompose(false); setComposerCampaign(null); }}
          onSuccess={() => setCampaignRefreshKey((k) => k + 1)}
          mode={composerMode}
          campaign={composerCampaign}
        />
      )}

      <div className="mx-auto p-8">
        <DashboardHeader
          title="Newsletter"
          description="Manage your newsletter subscribers and campaigns."
        />

        <div className="flex flex-col gap-8">

          {/* Stats Row */}
          <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 animate-fade-in-up">
            {stats.map((stat) => (
              <Card key={stat.label} className="flex flex-col justify-end h-[150px]">
                <CardContent className="flex flex-col items-start">
                  <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tab Bar + Actions */}
          <div className="flex items-center justify-between flex-wrap gap-3 animate-fade-in-up">
            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
              {(["subscribers", "campaigns"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {tab === "campaigns" ? <Megaphone size={16} /> : <User size={16}/>}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => { setComposerMode("create"); setComposerCampaign(null); setShowCompose(true); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                <PlusCircle size={16} />
                New Campaign
              </Button>
            </div>
          </div>

          <div className="animate-fade-in-up">
            {/* Subscribers Tab */}
            {activeTab === "subscribers" && (
              <NewsletterTable />
            )}

            {/* Campaigns Tab */}
            {activeTab === "campaigns" && (
              <CampaignTable
                key={campaignRefreshKey}
                onOpenComposer={(mode, campaign) => {
                  setComposerMode(mode);
                  setComposerCampaign(campaign);
                  setShowCompose(true);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Newsletter;