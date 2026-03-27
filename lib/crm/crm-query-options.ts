/**
 * CRM module React Query defaults: stale-while-revalidate.
 * Tabs read cached data first; background refetch when stale (see staleTime).
 */
export const CRM_STALE_TIME_MS = 60_000;

export const crmQueryOptions = {
  staleTime: CRM_STALE_TIME_MS,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
  /** Keep previous rows visible while refetching (SWR feel). */
  placeholderData: <T>(prev: T | undefined) => prev,
} as const;
