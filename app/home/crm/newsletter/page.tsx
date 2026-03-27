"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NewsletterTable from "@/components/tables/crm/NewsletterTable";
import CampaignTable from "@/components/tables/crm/CampaignTable";
import ComposerModal from "@/components/modal/crm/ComposerModal";
import { Megaphone, PlusCircle, User } from "lucide-react";
import type { Campaign } from "@/lib/types";
import { qk } from "@/lib/query-keys";
import { crmQueryOptions } from "@/lib/crm/crm-query-options";
import {
  crmNewsletterCampaignsTableDefaultFilters,
  crmNewsletterTableDefaultFilters,
} from "@/lib/crm/crm-filters";
import { fetchNewsletterCampaigns, fetchNewsletterSubscriptions } from "@/lib/crm/crm-fetchers";

function Newsletter() {
  const [activeTab, setActiveTab] = useState<"subscribers" | "campaigns">("subscribers");
  const [showCompose, setShowCompose] = useState(false);
  const [composerMode, setComposerMode] = useState<"create" | "view" | "edit">("create");
  const [composerCampaign, setComposerCampaign] = useState<Campaign | null>(null);

  const { data: subscriberMeta } = useQuery({
    queryKey: qk.newsletter(crmNewsletterTableDefaultFilters),
    queryFn: () => fetchNewsletterSubscriptions(crmNewsletterTableDefaultFilters),
    ...crmQueryOptions,
  });

  const { data: campaignMeta } = useQuery({
    queryKey: qk.newsletterCampaigns(crmNewsletterCampaignsTableDefaultFilters),
    queryFn: () => fetchNewsletterCampaigns(crmNewsletterCampaignsTableDefaultFilters),
    ...crmQueryOptions,
  });

  const totalSubscribers = subscriberMeta?.totalSubscribed ?? 0;
  const totalUnsubscribers = subscriberMeta?.totalUnsubscribed ?? 0;
  const totalSentCampaigns = campaignMeta?.totalSent ?? 0;

  const stats = [
    { label: "Total Subscribers", value: totalSubscribers, color: "text-emerald-600" },
    { label: "Campaigns Sent", value: totalSentCampaigns, color: "text-blue-600" },
    { label: "Avg. Open Rate", value: "55.6%", color: "text-primary" },
    { label: "Unsubscribers", value: totalUnsubscribers, color: "text-slate-500" },
  ];

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
      {showCompose && (
        <ComposerModal
          isOpen={showCompose}
          onClose={() => {
            setShowCompose(false);
            setComposerCampaign(null);
          }}
          onSuccess={() => {}}
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

          <div className="flex items-center justify-between flex-wrap gap-3 animate-fade-in-up">
            <div className="flex bg-accent rounded-lg p-1 gap-1">
              {(["subscribers", "campaigns"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${activeTab === tab ? "bg-primary text-white shadow" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {tab === "campaigns" ? <Megaphone size={16} /> : <User size={16} />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  setComposerMode("create");
                  setComposerCampaign(null);
                  setShowCompose(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
              >
                <PlusCircle size={16} />
                New Campaign
              </Button>
            </div>
          </div>

          <div className="animate-fade-in-up">
            {activeTab === "subscribers" && <NewsletterTable />}

            {activeTab === "campaigns" && (
              <CampaignTable
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
