import { QueryClient } from "@tanstack/react-query";

/** IAM / user-management lists: one fetch per session until invalidated. */
export const userManagementCacheOptions = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: 30 * 60 * 1000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
} as const;

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
