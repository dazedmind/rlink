import { useState, useEffect } from "react";
import type { Stats, RecentData, SiteStatus } from "../types";

export function useDashboardData() {
  const [stats, setStats] = useState<Stats>({ projects: 0, articles: 0, promos: 0, careers: 0 });
  const [recent, setRecent] = useState<RecentData>({ articles: [], promos: [], careers: [] });
  const [loading, setLoading] = useState(true);
  const [siteStatus, setSiteStatus] = useState<SiteStatus>("checking");
  const [siteUrl, setSiteUrl] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
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
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const [projectsRes, articlesRes, promosRes, careersRes] = await Promise.all([
          fetch("/api/projects", { credentials: "include" }),
          fetch("/api/articles?limit=1", { credentials: "include" }),
          fetch("/api/promos?limit=1", { credentials: "include" }),
          fetch("/api/careers?limit=1", { credentials: "include" }),
        ]);
        const [projectsData, articlesData, promosData, careersData] = await Promise.all([
          projectsRes.json(),
          articlesRes.json(),
          promosRes.json(),
          careersRes.json(),
        ]);
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
    fetch_();
  }, []);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const [articlesRes, promosRes, careersRes] = await Promise.all([
          fetch("/api/articles?limit=3&sort=newest", { credentials: "include" }),
          fetch("/api/promos?limit=3&sort=newest", { credentials: "include" }),
          fetch("/api/careers?limit=3&sort=newest", { credentials: "include" }),
        ]);
        const [articlesData, promosData, careersData] = await Promise.all([
          articlesRes.json(),
          promosRes.json(),
          careersRes.json(),
        ]);
        setRecent({
          articles: articlesData?.data ?? [],
          promos: promosData?.data ?? [],
          careers: careersData?.data ?? [],
        });
      } catch {
        setRecent({ articles: [], promos: [], careers: [] });
      }
    };
    fetch_();
  }, []);

  return { stats, recent, loading, siteStatus, siteUrl };
}
