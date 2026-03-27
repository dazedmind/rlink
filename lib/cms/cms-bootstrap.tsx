"use client";

import { useEffect, useState } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { cmsDashboardQueryOptions } from "@/lib/cms/cms-query-options";
import {
  fetchCmsDashboardStats,
  fetchCmsDashboardRecent,
  fetchCmsHealth,
} from "@/lib/cms/cms-dashboard-fetchers";

export async function prefetchCmsShellBootstrap(queryClient: QueryClient) {
  const jobs: Promise<unknown>[] = [
    queryClient.prefetchQuery({
      queryKey: [...qk.cmsDashboard(), "stats"] as const,
      queryFn: fetchCmsDashboardStats,
      ...cmsDashboardQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: [...qk.cmsDashboard(), "recent"] as const,
      queryFn: fetchCmsDashboardRecent,
      ...cmsDashboardQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: [...qk.cmsDashboard(), "health"] as const,
      queryFn: fetchCmsHealth,
      ...cmsDashboardQueryOptions,
    }),
  ];
  const settled = await Promise.allSettled(jobs);
  return { failed: settled.filter((r) => r.status === "rejected").length };
}

export function CmsQueryBootstrap() {
  const queryClient = useQueryClient();
  const [prefetchFailed, setPrefetchFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { failed } = await prefetchCmsShellBootstrap(queryClient);
      if (!cancelled && failed > 0) setPrefetchFailed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  if (!prefetchFailed) return null;

  return (
    <div
      role="status"
      className="mx-4 mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
    >
      Some CMS overview data could not be preloaded. Open Dashboard or a listing to load it.
    </div>
  );
}
