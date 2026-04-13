"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { cmsDashboardQueryOptions } from "@/lib/cms/cms-query-options";
import {
  fetchCmsDashboardStats,
  fetchCmsDashboardRecent,
  fetchCmsHealth,
} from "@/lib/cms/cms-dashboard-fetchers";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import DashboardSkeleton from "@/components/layout/skeleton/DashboardSkeleton";
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
import { Plus } from "lucide-react";
import AnnouncementModal from "@/components/modal/cms/AnnouncementModal";
import AnnouncementsManager from "@/app/home/cms/dashboard/components/AnnouncementsManager";
import type { Announcement } from "@/lib/cms/cms_types";

const EMPTY_STATS = { projects: 0, articles: 0, promos: 0, careers: 0 };
const EMPTY_RECENT = { articles: [] as RecentArticle[], promos: [] as RecentPromo[], careers: [] as RecentCareer[] };

export default function CMSDashboard({ onNavigate }: CMSDashboardProps) {
  const handleNav = (url: string) => onNavigate?.(url);

  const statsQuery = useQuery({
    queryKey: [...qk.cmsDashboard(), "stats"] as const,
    queryFn: fetchCmsDashboardStats,
    ...cmsDashboardQueryOptions,
  });

  const recentQuery = useQuery({
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

  const stats = statsQuery.data ?? EMPTY_STATS;
  const recent = recentQuery.data ?? EMPTY_RECENT;

  const statsError = statsQuery.isError || recentQuery.isError;
  const bothStatsLoaded =
    statsQuery.data !== undefined && recentQuery.data !== undefined;
  const showStatsSkeleton =
    !statsError &&
    !bothStatsLoaded &&
    (statsQuery.isPending || recentQuery.isPending);

  const siteStatus = health?.status ?? "checking";
  const siteUrl = health?.siteUrl ?? null;

  const handleRetryStats = () => {
    void statsQuery.refetch();
    void recentQuery.refetch();
  };

  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const openAnnouncementModal = (row: Announcement | null) => {
    setEditingAnnouncement(row);
    setAnnouncementModalOpen(true);
  };

  const closeAnnouncementModal = () => {
    setAnnouncementModalOpen(false);
    setEditingAnnouncement(null);
  };

  return (
    <main className="flex-1 overflow-auto m-4 border border-border rounded-xl h-full bg-background">
      <div className="mx-auto p-8">
        <header>
          <DashboardHeader
            title="Content Studio Manager"
            description="Overview of your content, projects, and listings."
          />
        </header>

        {statsError && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Could not load dashboard metrics.</span>
            <Button type="button" size="sm" variant="outline" onClick={handleRetryStats}>
              Retry
            </Button>
          </div>
        )}

        {showStatsSkeleton ? (
          <DashboardSkeleton variant="cms" />
        ) : (
          <div className="mt-8 flex flex-col gap-8 animate-fade-in-up">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {STAT_CARD_CONFIG.map((config) => (
                <StatCard
                  key={config.label}
                  label={config.label}
                  value={stats[config.label.toLowerCase() as keyof typeof stats]}
                  icon={config.icon}
                  iconBg={config.iconBg}
                  iconColor={config.iconColor}
                  loading={false}
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
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs gap-1"
                  onClick={() => openAnnouncementModal(null)}
                >
                  <Plus className="size-4" />
                  Create Announcement
                </Button>

                <AnnouncementsManager
                  onEdit={(a) => openAnnouncementModal(a)}
                />

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

            <AnnouncementModal
              isOpen={announcementModalOpen}
              onClose={closeAnnouncementModal}
              announcement={editingAnnouncement}
            />
          </div>
        )}
      </div>
    </main>
  );
}
