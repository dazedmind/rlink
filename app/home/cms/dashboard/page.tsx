"use client";

import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  FileText,
  Megaphone,
  Briefcase,
  Loader2,
  Globe,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type CMSDashboardProps = {
  onNavigate?: (tab: string) => void;
};

const QUICK_LINKS = [
  { label: "Projects", url: "listings/projects", icon: Building2, color: "text-blue-600" },
  { label: "News & Articles", url: "listings/news", icon: FileText, color: "text-blue-600" },
  { label: "Promos", url: "listings/promos", icon: Megaphone, color: "text-blue-600" },
  { label: "Careers", url: "listings/careers", icon: Briefcase, color: "text-blue-600" },
];

function CMSDashboard({ onNavigate }: CMSDashboardProps) {
  const [stats, setStats] = useState({
    projects: 0,
    articles: 0,
    promos: 0,
    careers: 0,
  });
  const [recent, setRecent] = useState<{
    articles: { id: number; headline: string; type: string; publishDate: string }[];
    promos: { id: number; title: string; status: string }[];
    careers: { id: number; position: string; status: string }[];
  }>({ articles: [], promos: [], careers: [] });
  const [loading, setLoading] = useState(true);
  const [siteStatus, setSiteStatus] = useState<"operational" | "degraded" | "checking">("checking");
  const [siteUrl, setSiteUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkSiteStatus = async () => {
      setSiteStatus("checking");
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const data = await res.json();
        setSiteStatus(data.site ?? (res.ok ? "operational" : "degraded"));
        setSiteUrl(data.siteUrl ?? null);
      } catch {
        setSiteStatus("degraded");
      }
    };
    checkSiteStatus();
    const interval = setInterval(checkSiteStatus, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [projectsRes, articlesRes, promosRes, careersRes] = await Promise.all([
          fetch("/api/projects", { credentials: "include" }),
          fetch("/api/articles?limit=1", { credentials: "include" }),
          fetch("/api/promos?limit=1", { credentials: "include" }),
          fetch("/api/careers?limit=1", { credentials: "include" }),
        ]);

        const projectsData = await projectsRes.json();
        const articlesData = await articlesRes.json();
        const promosData = await promosRes.json();
        const careersData = await careersRes.json();

        setStats({
          projects: Array.isArray(projectsData) ? projectsData.length : 0,
          articles: articlesData?.total ?? 0,
          promos: promosData?.total ?? 0,
          careers: careersData?.total ?? 0,
        });
      } catch {
        setStats({ projects: 0, articles: 0, promos: 0, careers: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const [articlesRes, promosRes, careersRes] = await Promise.all([
          fetch("/api/articles?limit=3&sort=newest", { credentials: "include" }),
          fetch("/api/promos?limit=3&sort=newest", { credentials: "include" }),
          fetch("/api/careers?limit=3&sort=newest", { credentials: "include" }),
        ]);

        const articlesData = await articlesRes.json();
        const promosData = await promosRes.json();
        const careersData = await careersRes.json();

        setRecent({
          articles: articlesData?.data ?? [],
          promos: promosData?.data ?? [],
          careers: careersData?.data ?? [],
        });
      } catch {
        setRecent({ articles: [], promos: [], careers: [] });
      }
    };

    fetchRecent();
  }, []);

  const statCards = [
    { label: "Projects", value: stats.projects, icon: Building2, url: "listings/projects" },
    { label: "Articles", value: stats.articles, icon: FileText, url: "listings/news" },
    { label: "Promos", value: stats.promos, icon: Megaphone, url: "listings/promos" },
    { label: "Careers", value: stats.careers, icon: Briefcase, url: "listings/careers" },
  ];

  const handleNav = (url: string) => {
    onNavigate?.(url);
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl h-full bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Content Studio Manager"
          description="Overview of your content, projects, and listings."
        />

        <div className="flex flex-col gap-8">
          {/* Website status */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-slate-50/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <Globe className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">Website status</p>
                <p className="text-xs text-muted-foreground">
                  {siteUrl ? `Monitoring ${siteUrl}` : "Checking backend health..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {siteStatus === "checking" && (
                <>
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Checking...</span>
                </>
              )}
              {siteStatus === "operational" && (
                <>
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700">Operational</span>
                  <CheckCircle2 className="size-4 text-emerald-600" />
                </>
              )}
              {siteStatus === "degraded" && (
                <>
                  <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm font-medium text-amber-700">Degraded</span>
                  <XCircle className="size-4 text-amber-600" />
                </>
              )}
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <button
                key={card.label}
                type="button"
                onClick={() => handleNav(card.url)}
                className="text-left transition-all "
              >
                <Card className="flex justify-end h-[140px] border-border hover:bg-accent hover:border-primary/30 transition-colors cursor-pointer relative overflow-hidden">
                  <CardContent className="flex flex-col items-end ">
                    <div className="flex items-center justify-between w-full">
                      {loading ? (
                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                      ) : (
                        <span className="text-4xl font-bold">{card.value}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                      {/* <ArrowRight className="size-4 text-muted-foreground" /> */}
                    </div>
                    <span className="absolute -bottom-4 right-4">
                      <card.icon className="size-20 text-muted-foreground/20 stroke-2" />
                    </span>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Quick access
            </h3>
            <div className="flex gap-3">
              {QUICK_LINKS.map((link) => (
                <Button
                  key={link.url}
                  variant="outline"
                  size="lg"
                  onClick={() => handleNav(link.url)}
                  className="flex-1 gap-2 uppercase font-medium w-full"
                >
                  <link.icon className={`size-4 ${link.color}`} />
                  {link.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Recent articles */}
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Recent Articles</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNav("listings/news")}
                    className="text-xs"
                  >
                    View all
                  </Button>
                </div>
                {recent.articles.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No articles yet</p>
                ) : (
                  <ul className="space-y-3">
                    {recent.articles.map((a) => (
                      <li
                        key={a.id}
                        className="text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0"
                      >
                        <p className="font-medium truncate">{a.headline}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.type} · {formatDate(a.publishDate)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Recent promos */}
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Recent Promos</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNav("listings/promos")}
                    className="text-xs"
                  >
                    View all
                  </Button>
                </div>
                {recent.promos.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No promos yet</p>
                ) : (
                  <ul className="space-y-3">
                    {recent.promos.map((p) => (
                      <li
                        key={p.id}
                        className="text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0"
                      >
                        <p className="font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.status}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Recent careers */}
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Recent Careers</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNav("listings/careers")}
                    className="text-xs"
                  >
                    View all
                  </Button>
                </div>
                {recent.careers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No job postings yet</p>
                ) : (
                  <ul className="space-y-3">
                    {recent.careers.map((c) => (
                      <li
                        key={c.id}
                        className="text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0"
                      >
                        <p className="font-medium truncate">{c.position}</p>
                        <p className="text-xs text-muted-foreground capitalize">{c.status}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CMSDashboard;
