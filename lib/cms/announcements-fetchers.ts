import type { Announcement } from "@/lib/cms/cms_types";

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await fetch("/api/announcements", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load announcements");
  const json = (await res.json()) as { data: Announcement[] };
  return json.data ?? [];
}
