import { Globe, Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { SiteStatus } from "../types";

type StatusPillProps = {
  status: SiteStatus;
  siteUrl: string | null;
};

export function StatusPill({ status, siteUrl }: StatusPillProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-slate-50/50 px-4 py-2.5 text-sm">
      <Globe className="size-4 text-muted-foreground" />
      <span className="text-muted-foreground text-xs">
        {siteUrl ? `Monitoring ${siteUrl}` : "Checking backend health..."}
      </span>

      <span className="ml-auto flex items-center gap-2">
        {status === "checking" && (
          <>
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Checking...</span>
          </>
        )}
        {status === "operational" && (
          <>
            <span className="flex size-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-emerald-700">Operational</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </>
        )}
        {status === "degraded" && (
          <>
            <span className="flex size-2 animate-pulse rounded-full bg-amber-500" />
            <span className="font-medium text-amber-700">Degraded</span>
            <XCircle className="size-4 text-amber-600" />
          </>
        )}
      </span>
    </div>
  );
}
