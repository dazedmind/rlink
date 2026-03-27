import { toast } from "sonner";
import { qk } from "@/lib/query-keys";
import type { UserRecord } from "@/components/modal/iam/UserFormModal";
import type { ActivityLogRecord } from "@/lib/types";
import type { ModuleAccessConfig } from "@/lib/iam/module-access-types";

export const IAM_USERS_LIST_KEY = [...qk.userManagementDashboard(), "users-list"] as const;

const USERS_EXPORT_LIMIT = 10000;

export async function fetchUsersList(): Promise<{ users: UserRecord[]; total: number }> {
  try {
    const { authClient } = await import("@/lib/auth-client");
    const result = await authClient.admin.listUsers({
      query: {
        limit: USERS_EXPORT_LIMIT,
        offset: 0,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
    });

    if (result.error) {
      toast.error(result.error.message ?? "Failed to load users.");
      return { users: [], total: 0 };
    }

    const data = result.data as { users?: UserRecord[]; total?: number } | undefined;
    return {
      users: (data?.users ?? []) as UserRecord[],
      total: data?.total ?? 0,
    };
  } catch {
    toast.error("Failed to load users.");
    return { users: [], total: 0 };
  }
}

export async function fetchActivityLogsPage(filters: {
  page: number;
  limit: number;
  sort: string;
}): Promise<{ logs: ActivityLogRecord[]; total: number }> {
  let res: Response;
  try {
    res = await fetch(
      `/api/activity-logs?page=${filters.page}&limit=${filters.limit}&sort=${filters.sort}`,
      { credentials: "include" },
    );
  } catch {
    toast.error("Failed to load activity logs.");
    throw new Error("Failed to load activity logs.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: string }).error ?? "Failed to load activity logs.";
    toast.error(msg);
    throw new Error(msg);
  }
  const json = await res.json();
  const rows = (json.data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    createdAt:
      typeof r.createdAt === "string"
        ? r.createdAt
        : r.createdAt
          ? new Date(r.createdAt as Date).toISOString()
          : "",
  })) as ActivityLogRecord[];
  return { logs: rows, total: json.total ?? 0 };
}

export async function fetchModuleAccessConfig(): Promise<ModuleAccessConfig> {
  const res = await fetch("/api/developer-tools/settings?section=module-access", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch");
  const json = await res.json();
  return (json.data ?? {}) as ModuleAccessConfig;
}
