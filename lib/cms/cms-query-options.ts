/** CMS shell / dashboard: stale-while-revalidate (aligned with CRM module pattern). */
export const CMS_DASHBOARD_STALE_MS = 60_000;

export const cmsDashboardQueryOptions = {
  staleTime: CMS_DASHBOARD_STALE_MS,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
  placeholderData: <T>(prev: T | undefined) => prev,
} as const;
