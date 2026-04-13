"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import DashboardHeader from "@/components/layout/DashboardHeader";
import {
  SettingsFormSection,
  FormField,
} from "@/components/layout/forms/SettingsFormSection";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";

type SecuritySettings = {
  recaptchaSiteKey?: string;
  enableRecaptcha?: boolean;
  honeypotEnabled?: boolean;
  allowedEmbedDomains?: string;
};

const DEFAULT_SECURITY: SecuritySettings = {
  recaptchaSiteKey: "",
  enableRecaptcha: false,
  honeypotEnabled: true,
  allowedEmbedDomains: "",
};

const fetchSecuritySettings = async () => {
  const res = await fetch("/api/developer-tools/settings?section=security", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load security settings.");
  const json = await res.json();
  const data = json.data ?? {};
  return {
    recaptchaSiteKey: data.recaptchaSiteKey ?? "",
    enableRecaptcha: data.enableRecaptcha === true,
    honeypotEnabled: data.honeypotEnabled !== false,
    allowedEmbedDomains: Array.isArray(data.allowedEmbedDomains)
      ? data.allowedEmbedDomains.join("\n")
      : (data.allowedEmbedDomains ?? ""),
  };
};

const patchSettings = async (payload: {
  section: string;
  value: {
    recaptchaSiteKey: string;
    enableRecaptcha: boolean;
    honeypotEnabled: boolean;
    allowedEmbedDomains: string[];
  };
}) => {
  const res = await fetch("/api/developer-tools/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to save settings.");
  }
};

export default function SecurityToolsPage() {
  const queryClient = useQueryClient();
  const { guard, release } = useSubmitGuard();
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SECURITY);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: qk.developerToolsSettings("security"),
    queryFn: fetchSecuritySettings,
  });

  React.useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  React.useEffect(() => {
    if (isError) toast.error("Failed to load security settings.");
  }, [isError]);

  const patchMutation = useMutation({
    mutationFn: patchSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: qk.developerToolsSettings("security"),
      });
      toast.success("Security settings saved successfully.");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings.",
      );
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/developer-tools/cache", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to clear cache.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Landing page cache cleared successfully.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to clear cache.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guard()) return;
    const domains =
      settings.allowedEmbedDomains
        ?.split("\n")
        .map((d) => d.trim())
        .filter(Boolean) ?? [];
    patchMutation.mutate(
      {
        section: "security",
        value: {
          recaptchaSiteKey: settings.recaptchaSiteKey ?? "",
          enableRecaptcha: settings.enableRecaptcha ?? false,
          honeypotEnabled: settings.honeypotEnabled ?? true,
          allowedEmbedDomains: domains,
        },
      },
      { onSettled: release },
    );
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
        <div className="mx-auto p-8">
          <DashboardHeader
            title="Security Tools"
            description="Configure security for the landing page."
          />
          <div className="mt-8 h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
        <div className="mx-auto p-8">
          <DashboardHeader
            title="Security Tools"
            description="Configure security for the landing page."
          />
          <div className="mt-8 h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <p>Failed to load security settings.</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Security Tools"
          description="Configure reCAPTCHA, honeypot, and embed domain restrictions for the landing page."
        />

        <div className="mt-8 flex flex-col gap-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
            <div>
              <h3 className="font-semibold text-foreground">Clear Website Cache</h3>
              <p className="text-sm text-muted-foreground">
                Clear the public landing page cache only. Requires SITE_URL and REVALIDATION_SECRET.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!guard()) return;
                clearCacheMutation.mutate(undefined, { onSettled: release });
              }}
              className="gap-2"
            >
              <Trash2 className="size-4" />
              Clear Cache
            </Button>
          </div>

          <SettingsFormSection
            title="Security Configuration"
            description="Form protection and embed restrictions"
            icon={Shield}
            onSubmit={handleSubmit}
          >
            <FormField
              label="Google reCAPTCHA Site Key"
              hint="Public site key from Google reCAPTCHA admin"
            >
              <input
                type="text"
                value={settings.recaptchaSiteKey ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, recaptchaSiteKey: e.target.value }))
                }
                placeholder="6Lc..."
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring"
              />
            </FormField>

            <FormField label="Enable reCAPTCHA for forms">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={settings.enableRecaptcha ?? false}
                  onCheckedChange={(c) =>
                    setSettings((s) => ({ ...s, enableRecaptcha: c === true }))
                  }
                />
                <span className="text-sm text-foreground">
                  Require reCAPTCHA verification on form submissions
                </span>
              </label>
            </FormField>

            <FormField label="Honeypot spam protection">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={settings.honeypotEnabled ?? true}
                  onCheckedChange={(c) =>
                    setSettings((s) => ({ ...s, honeypotEnabled: c === true }))
                  }
                />
                <span className="text-sm text-foreground">
                  Use honeypot field to catch bots
                </span>
              </label>
            </FormField>

            <FormField
              label="Allowed embed domains"
              hint="One domain per line. Iframes/embeds from other domains will be blocked."
            >
              <textarea
                value={settings.allowedEmbedDomains ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    allowedEmbedDomains: e.target.value,
                  }))
                }
                placeholder="youtube.com&#10;vimeo.com&#10;maps.google.com"
                rows={5}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring resize-none font-mono"
              />
            </FormField>
          </SettingsFormSection>
        </div>
      </div>
    </main>
  );
}
