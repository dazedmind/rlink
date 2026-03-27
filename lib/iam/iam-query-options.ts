import { iamCacheOptions } from "@/lib/query-client";

/** SWR-style placeholder while IAM list queries refetch. */
export const iamTableQueryOptions = {
  ...iamCacheOptions,
  placeholderData: <T>(prev: T | undefined) => prev,
} as const;
