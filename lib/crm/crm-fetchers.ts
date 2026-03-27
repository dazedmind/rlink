import type { Project, InventoryItem } from "@/lib/types";

export type LeadsListResult = { data: unknown[]; total: number };

export function buildLeadsUrl(filters: {
  page: number;
  limit: number;
  sort: string;
  status: string;
  stage: string;
  nextAction: string;
}) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
    sort: filters.sort,
  });
  if (filters.status) params.set("status", filters.status);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.nextAction) params.set("nextAction", filters.nextAction);
  return `/api/leads?${params}`;
}

export async function fetchLeadsList(filters: Record<string, unknown>): Promise<LeadsListResult> {
  const f = filters as {
    page: number;
    limit: number;
    sort: string;
    status: string;
    stage: string;
    nextAction: string;
  };
  const res = await fetch(buildLeadsUrl(f));
  if (!res.ok) throw new Error("Failed to fetch leads");
  const json = await res.json();
  return { data: json.data ?? [], total: json.total ?? 0 };
}

export type ReservationsListResult = { data: unknown[]; total: number };

export function buildReservationsUrl(filters: {
  page: number;
  limit: number;
  sort: string;
  status: string;
}) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
    sort: filters.sort,
  });
  if (filters.status) params.set("status", filters.status);
  return `/api/reservation?${params}`;
}

export async function fetchReservationsList(
  filters: Record<string, unknown>,
): Promise<ReservationsListResult> {
  const f = filters as { page: number; limit: number; sort: string; status: string };
  const res = await fetch(buildReservationsUrl(f));
  if (!res.ok) throw new Error("Failed to fetch reservations");
  const json = await res.json();
  return { data: json.data ?? [], total: json.total ?? 0 };
}

export type InquiriesListResult = { data: unknown[]; total: number };

export function buildInquiriesUrl(filters: {
  page: number;
  limit: number;
  sort: string;
  status: string;
  subject: string;
  source: string;
}) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
    sort: filters.sort,
  });
  if (filters.status) params.set("status", filters.status);
  if (filters.subject) params.set("subject", filters.subject);
  if (filters.source) params.set("source", filters.source);
  return `/api/inquiries?${params}`;
}

export async function fetchInquiriesList(filters: Record<string, unknown>): Promise<InquiriesListResult> {
  const f = filters as {
    page: number;
    limit: number;
    sort: string;
    status: string;
    subject: string;
    source: string;
  };
  const res = await fetch(buildInquiriesUrl(f));
  if (!res.ok) throw new Error("Failed to fetch inquiries");
  const json = await res.json();
  return { data: json.data ?? [], total: json.total ?? 0 };
}

export type NewsletterSubscriptionsResult = {
  data: unknown[];
  total: number;
  totalSubscribed: number;
  totalUnsubscribed: number;
};

export function buildNewsletterSubscriptionsUrl(filters: {
  page: number;
  limit: number;
  sort: string;
  status: string;
}) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
    sort: filters.sort,
  });
  if (filters.status) params.set("status", filters.status);
  return `/api/newsletter/subscriptions?${params}`;
}

export async function fetchNewsletterSubscriptions(
  filters: Record<string, unknown>,
): Promise<NewsletterSubscriptionsResult> {
  const f = filters as { page: number; limit: number; sort: string; status: string };
  const res = await fetch(buildNewsletterSubscriptionsUrl(f), { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch subscribers");
  const json = await res.json();
  return {
    data: json.data ?? [],
    total: json.total ?? 0,
    totalSubscribed: json.totalSubscribed ?? 0,
    totalUnsubscribed: json.totalUnsubscribed ?? 0,
  };
}

export type NewsletterCampaignsResult = {
  data: unknown[];
  total: number;
  totalSent: number;
};

export function buildNewsletterCampaignsUrl(filters: {
  page: number;
  limit: number;
  sort: string;
  status: string;
}) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
    sort: filters.sort,
  });
  if (filters.status) params.set("status", filters.status);
  return `/api/newsletter/campaigns?${params}`;
}

export async function fetchNewsletterCampaigns(
  filters: Record<string, unknown>,
): Promise<NewsletterCampaignsResult> {
  const f = filters as { page: number; limit: number; sort: string; status: string };
  const res = await fetch(buildNewsletterCampaignsUrl(f), { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  const json = await res.json();
  return {
    data: json.data ?? [],
    total: json.total ?? 0,
    totalSent: json.totalSent ?? 0,
  };
}

export async function fetchProjectsList(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

export async function fetchProjectInventoryAll(): Promise<InventoryItem[]> {
  const res = await fetch("/api/projects/inventory");
  if (!res.ok) throw new Error("Failed to fetch inventory");
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}
