import type { RecentData, SiteStatus, Stats } from "@/app/home/cms/dashboard/types";

export async function fetchCmsDashboardStats(): Promise<Stats> {
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
  return {
    projects: Array.isArray(projectsData) ? projectsData.length : 0,
    articles: articlesData?.total ?? 0,
    promos: promosData?.total ?? 0,
    careers: careersData?.total ?? 0,
  };
}

export async function fetchCmsDashboardRecent(): Promise<RecentData> {
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
  return {
    articles: articlesData?.data ?? [],
    promos: promosData?.data ?? [],
    careers: careersData?.data ?? [],
  };
}

export async function fetchCmsHealth(): Promise<{ status: SiteStatus; siteUrl: string | null }> {
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    const data = await res.json();
    return {
      status: data.site ?? (res.ok ? "operational" : "degraded"),
      siteUrl: data.siteUrl ?? null,
    };
  } catch {
    return { status: "degraded", siteUrl: null };
  }
}
