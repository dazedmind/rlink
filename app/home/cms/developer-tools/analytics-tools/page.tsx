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
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type AnalyticsSettings = {
  googleTagManagerId?: string;
  googleAnalyticsId?: string;
  metaPixelId?: string;
  enablePageViewTracking?: boolean;
  enableLeadTracking?: boolean;
};

const DEFAULT_ANALYTICS: AnalyticsSettings = {
  googleTagManagerId: "",
  googleAnalyticsId: "",
  metaPixelId: "",
  enablePageViewTracking: true,
  enableLeadTracking: true,
};

const fetchAnalyticsSettings = async () => {
  const res = await fetch("/api/developer-tools/settings?section=analytics", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load analytics settings.");
  const json = await res.json();
  const data = json.data ?? {};
  return {
    googleTagManagerId: data.googleTagManagerId ?? "",
    googleAnalyticsId: data.googleAnalyticsId ?? "",
    metaPixelId: data.metaPixelId ?? "",
    enablePageViewTracking: data.enablePageViewTracking !== false,
    enableLeadTracking: data.enableLeadTracking !== false,
  };
};

const patchSettings = async (payload: {
  section: string;
  value: AnalyticsSettings;
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

export default function AnalyticsToolsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<AnalyticsSettings>(DEFAULT_ANALYTICS);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: qk.developerToolsSettings("analytics"),
    queryFn: fetchAnalyticsSettings,
  });

  React.useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  React.useEffect(() => {
    if (isError) toast.error("Failed to load analytics settings.");
  }, [isError]);

  const patchMutation = useMutation({
    mutationFn: patchSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: qk.developerToolsSettings("analytics"),
      });
      toast.success("Analytics settings saved successfully.");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    patchMutation.mutate({ section: "analytics", value: settings });
  };

  // Conditional rendering after all hooks
  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
        <div className="mx-auto p-8">
          <DashboardHeader
            title="Analytics Tools"
            description="Configure tracking for the landing page."
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
            title="Analytics Tools"
            description="Configure tracking for the landing page."
          />
          <div className="mt-8 h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <p>Failed to load analytics settings.</p>
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
          title="Analytics Tools"
          description="Configure analytics and tracking IDs for the landing page. Changes apply to the public site."
        />

        <div className="mt-8 flex flex-col gap-8 animate-in fade-in duration-500">
          <SettingsFormSection
            title="Analytics Configuration"
            description="Tracking IDs and event toggles"
            icon={BarChart3}
            onSubmit={handleSubmit}
            isSubmitting={patchMutation.isPending}
          >
            <FormField
              label="Google Tag Manager Container ID"
              hint="Generate on Google Tag Manager"
            >
              <input
                type="text"
                value={settings.googleTagManagerId ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, googleTagManagerId: e.target.value }))
                }
                placeholder="GTM-XXXXXXX"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring"
              />
            </FormField>

            <FormField
              label="Google Analytics Measurement ID (GA4)"
              hint="Generate on Google Analytics"
            >
              <input
                type="text"
                value={settings.googleAnalyticsId ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, googleAnalyticsId: e.target.value }))
                }
                placeholder="G-XXXXXXXXXX"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring"
              />
            </FormField>

            <FormField
              label="Meta Pixel ID"
              hint="Generate on Facebook/Meta"
            >
              <input
                type="text"
                value={settings.metaPixelId ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, metaPixelId: e.target.value }))
                }
                placeholder="123456789012345"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring"
              />
            </FormField>

            <div className="flex flex-col gap-4">
              <FormField label="Enable Page View Tracking">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={settings.enablePageViewTracking ?? true}
                    onCheckedChange={(c) =>
                      setSettings((s) => ({
                        ...s,
                        enablePageViewTracking: c === true,
                      }))
                    }
                  />
                  <span className="text-sm text-foreground">
                    Track page views
                  </span>
                </label>
              </FormField>

              <FormField label="Enable Lead Tracking">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={settings.enableLeadTracking ?? true}
                    onCheckedChange={(c) =>
                      setSettings((s) => ({
                        ...s,
                        enableLeadTracking: c === true,
                      }))
                    }
                  />
                  <span className="text-sm text-foreground">
                    Track form submissions and lead events
                  </span>
                </label>
              </FormField>
            </div>
          </SettingsFormSection>
        </div>
      </div>
    </main>
  );
}
