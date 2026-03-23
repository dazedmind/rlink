const CACHE_KEY = "rlink:module-access";
const TTL_MS = 5 * 60 * 1000; // 5 minutes

type Cached = { data: unknown; at: number };

export function getModuleAccessCache(): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, at }: Cached = JSON.parse(raw);
    if (Date.now() - at > TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

export function setModuleAccessCache(data: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, at: Date.now() }));
  } catch {
    // ignore quota / privacy
  }
}

export function clearModuleAccessCache(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
