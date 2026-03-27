"use client";

import { useEffect, useState } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { crmQueryOptions } from "@/lib/crm/crm-query-options";
import {
  crmLeadsStatsFilters,
  crmLeadsRecentFilters,
  crmLeadsTableDefaultFilters,
  crmReservationsRecentFilters,
  crmReservationsTableDefaultFilters,
  crmReservationsInventoryFilters,
  crmInquiriesRecentFilters,
  crmInquiriesTableDefaultFilters,
  crmNewsletterTableDefaultFilters,
  crmNewsletterCampaignsTableDefaultFilters,
} from "@/lib/crm/crm-filters";
import {
  fetchLeadsList,
  fetchReservationsList,
  fetchInquiriesList,
  fetchNewsletterSubscriptions,
  fetchNewsletterCampaigns,
  fetchProjectsList,
  fetchProjectInventoryAll,
} from "@/lib/crm/crm-fetchers";

/**
 * Prefetches CRM list queries used by the dashboard and default tab views.
 * Uses Promise.allSettled so one failure does not block other caches.
 */
export async function prefetchCrmBootstrap(queryClient: QueryClient) {
  const jobs: Promise<unknown>[] = [
    queryClient.prefetchQuery({
      queryKey: qk.leads(crmLeadsStatsFilters),
      queryFn: () => fetchLeadsList(crmLeadsStatsFilters),
      ...crmQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: qk.leads(crmLeadsRecentFilters),
      queryFn: () => fetchLeadsList(crmLeadsRecentFilters),
      ...crmQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: qk.leads(crmLeadsTableDefaultFilters),
      queryFn: () => fetchLeadsList(crmLeadsTableDefaultFilters),
      ...crmQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: qk.reservations(crmReservationsRecentFilters),
      queryFn: () => fetchReservationsList(crmReservationsRecentFilters),
      ...crmQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: qk.reservations(crmReservationsTableDefaultFilters),
      queryFn: () => fetchReservationsList(crmReservationsTableDefaultFilters),
      ...crmQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: qk.reservations(crmReservationsInventoryFilters),
      queryFn: () => fetchReservationsList(crmReservationsInventoryFilters),
      ...crmQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: qk.inquiries(crmInquiriesRecentFilters),
      queryFn: () => fetchInquiriesList(crmInquiriesRecentFilters),
      ...crmQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: qk.inquiries(crmInquiriesTableDefaultFilters),
      queryFn: () => fetchInquiriesList(crmInquiriesTableDefaultFilters),
      ...crmQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: qk.projects(),
      queryFn: fetchProjectsList,
      ...crmQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: qk.projectInventory(),
      queryFn: fetchProjectInventoryAll,
      ...crmQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: qk.newsletter(crmNewsletterTableDefaultFilters),
      queryFn: () => fetchNewsletterSubscriptions(crmNewsletterTableDefaultFilters),
      ...crmQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: qk.newsletterCampaigns(crmNewsletterCampaignsTableDefaultFilters),
      queryFn: () => fetchNewsletterCampaigns(crmNewsletterCampaignsTableDefaultFilters),
      ...crmQueryOptions,
    }),
  ];

  const settled = await Promise.allSettled(jobs);
  return { failed: settled.filter((r) => r.status === "rejected").length };
}

/**
 * Runs once when the CRM shell mounts. Individual tabs still run their own
 * useQuery hooks and will fetch on demand if prefetch missed or failed.
 */
export function CrmQueryBootstrap() {
  const queryClient = useQueryClient();
  const [prefetchFailed, setPrefetchFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { failed } = await prefetchCrmBootstrap(queryClient);
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
      Some CRM data could not be preloaded. Open a tab to load it, or refresh the page.
    </div>
  );
}
