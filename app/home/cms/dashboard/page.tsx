"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { cmsDashboardQueryOptions } from "@/lib/cms/cms-query-options";
import {
  fetchCmsDashboardStats,
  fetchCmsDashboardRecent,
  fetchCmsHealth,
} from "@/lib/cms/cms-dashboard-fetchers";
import DashboardHeader from "@/components/layout/DashboardHeader";
import {
  StatusPill,
  StatCard,
  RecentListCard,
  QuickLinksCard,
  ActivityFeedCard,
} from "./components";
import { formatDate } from "./utils";
import { STAT_CARD_CONFIG } from "./constants";
import type {
  CMSDashboardProps,
  RecentArticle,
  RecentPromo,
  RecentCareer,
} from "./types";

export default function CMSDashboard({ onNavigate }: CMSDashboardProps) {
  const handleNav = (url: string) => onNavigate?.(url);

  const { data: stats = { projects: 0, articles: 0, promos: 0, careers: 0 }, isPending: loadingStats } =
    useQuery({
      queryKey: [...qk.cmsDashboard(), "stats"] as const,
      queryFn: fetchCmsDashboardStats,
      ...cmsDashboardQueryOptions,
    });

  const {
    data: recent = { articles: [], promos: [], careers: [] },
    isPending: loadingRecent,
  } = useQuery({
    queryKey: [...qk.cmsDashboard(), "recent"] as const,
    queryFn: fetchCmsDashboardRecent,
    ...cmsDashboardQueryOptions,
  });

  const { data: health } = useQuery({
    queryKey: [...qk.cmsDashboard(), "health"] as const,
    queryFn: fetchCmsHealth,
    ...cmsDashboardQueryOptions,
    refetchInterval: 60_000,
  });

  const loading = loadingStats || loadingRecent;
  const siteStatus = health?.status ?? "checking";
  const siteUrl = health?.siteUrl ?? null;

  return (
    <main className="flex-1 overflow-auto m-4 border border-border rounded-xl h-full bg-background">
      <div className="mx-auto p-8">
        <header>
          <DashboardHeader
            title="Content Studio Manager"
            description="Overview of your content, projects, and listings."
          />
        </header>

        <div className="mt-8 flex flex-col gap-8">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {STAT_CARD_CONFIG.map((config) => (
              <StatCard
                key={config.label}
                label={config.label}
                value={stats[config.label.toLowerCase() as keyof typeof stats]}
                icon={config.icon}
                iconBg={config.iconBg}
                iconColor={config.iconColor}
                loading={loading}
                onClick={() => handleNav(config.url)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
            <div className="flex flex-col gap-4">
              <StatusPill status={siteStatus} siteUrl={siteUrl} />

              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Activity
              </p>

              <RecentListCard<RecentArticle>
                title="Articles"
                items={recent.articles}
                emptyMessage="No articles yet"
                onViewAll={() => handleNav("listings/news")}
                renderItem={(a) => (
                  <>
                    <p className="text-sm font-medium truncate">{a.headline}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.type} · {formatDate(a.publishDate)}
                    </p>
                  </>
                )}
                getStatus={() => "published"}
              />

              <RecentListCard<RecentPromo>
                title="Promos"
                items={recent.promos}
                emptyMessage="No promos yet"
                onViewAll={() => handleNav("listings/promos")}
                renderItem={(p) => <p className="text-sm font-medium truncate">{p.title}</p>}
                getStatus={(p) => p.status}
              />

              <RecentListCard<RecentCareer>
                title="Careers"
                items={recent.careers}
                emptyMessage="No job postings yet"
                onViewAll={() => handleNav("listings/careers")}
                renderItem={(c) => <p className="text-sm font-medium truncate">{c.position}</p>}
                getStatus={(c) => c.status}
              />
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Links
              </p>
              <QuickLinksCard onNavigate={handleNav} />

              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">
                Activity Feed
              </p>
              <ActivityFeedCard />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
