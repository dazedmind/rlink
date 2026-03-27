"use client";

import { useEffect, useState } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { iamCacheOptions } from "@/lib/query-client";
import { iamActivityLogsDefaultFilters } from "@/lib/iam/iam-filters";
import {
  IAM_USERS_LIST_KEY,
  fetchUsersList,
  fetchActivityLogsPage,
  fetchModuleAccessConfig,
} from "@/lib/iam/iam-fetchers";

export async function prefetchIamBootstrap(queryClient: QueryClient) {
  const jobs: Promise<unknown>[] = [
    queryClient.prefetchQuery({
      queryKey: IAM_USERS_LIST_KEY,
      queryFn: fetchUsersList,
      ...iamCacheOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: qk.activityLogs(iamActivityLogsDefaultFilters),
      queryFn: () => fetchActivityLogsPage(iamActivityLogsDefaultFilters),
      ...iamCacheOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: qk.developerToolsSettings("module-access"),
      queryFn: fetchModuleAccessConfig,
      ...iamCacheOptions,
    }),
  ];
  const settled = await Promise.allSettled(jobs);
  return { failed: settled.filter((r) => r.status === "rejected").length };
}

export function IamQueryBootstrap() {
  const queryClient = useQueryClient();
  const [prefetchFailed, setPrefetchFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { failed } = await prefetchIamBootstrap(queryClient);
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
      Some IAM data could not be preloaded. Open a tab to load it, or refresh the page.
    </div>
  );
}
