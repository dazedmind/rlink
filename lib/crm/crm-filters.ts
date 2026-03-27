/**
 * Canonical filter objects for CRM list queries. Use these for prefetch keys so
 * the dashboard and tab tables share the same cache entries when defaults match.
 */

const newest = "newest" as const;

/** Dashboard lead cards (monthly stats): max page size per API. */
export const crmLeadsStatsFilters = {
  page: 1,
  limit: 100,
  sort: newest,
  status: "",
  stage: "",
  nextAction: "",
} as const;

/** Dashboard “Recent Leads” + LeadsTable recentViewOnly. */
export const crmLeadsRecentFilters = {
  page: 1,
  limit: 3,
  sort: newest,
  status: "",
  stage: "",
  nextAction: "",
} as const;

/** Lead Generation default first page. */
export const crmLeadsTableDefaultFilters = {
  page: 1,
  limit: 10,
  sort: newest,
  status: "",
  stage: "",
  nextAction: "",
} as const;

/**
 * Dashboard reservation total + “Recent Reservations” (same response includes global total).
 */
export const crmReservationsRecentFilters = {
  page: 1,
  limit: 3,
  sort: newest,
  status: "",
} as const;

export const crmReservationsTableDefaultFilters = {
  page: 1,
  limit: 10,
  sort: newest,
  status: "",
} as const;

/** Inventory: single-page slice (API max limit 100). */
export const crmReservationsInventoryFilters = {
  page: 1,
  limit: 100,
  sort: newest,
  status: "",
} as const;

export const crmInquiriesRecentFilters = {
  page: 1,
  limit: 5,
  sort: newest,
  status: "",
  subject: "",
  source: "",
} as const;

export const crmInquiriesTableDefaultFilters = {
  page: 1,
  limit: 10,
  sort: newest,
  status: "",
  subject: "",
  source: "",
} as const;

/** Newsletter subscribers: first page + header stats (totalSubscribed / totalUnsubscribed). */
export const crmNewsletterTableDefaultFilters = {
  page: 1,
  limit: 10,
  sort: newest,
  status: "",
} as const;

/** Campaigns: first page + totalSent in JSON. */
export const crmNewsletterCampaignsTableDefaultFilters = {
  page: 1,
  limit: 10,
  sort: newest,
  status: "",
} as const;
