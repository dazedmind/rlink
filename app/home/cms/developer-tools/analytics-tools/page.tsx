"use client";

import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { SettingsFormSection, FormField } from "@/components/forms/SettingsFormSection";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";

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

export default function AnalyticsToolsPage() {
  const [settings, setSettings] = useState<AnalyticsSettings>(DEFAULT_ANALYTICS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/developer-tools/settings?section=analytics", {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          const data = json.data ?? {};
          setSettings({
            googleTagManagerId: data.googleTagManagerId ?? "",
            googleAnalyticsId: data.googleAnalyticsId ?? "",
            metaPixelId: data.metaPixelId ?? "",
            enablePageViewTracking: data.enablePageViewTracking !== false,
            enableLeadTracking: data.enableLeadTracking !== false,
          });
        }
      } catch {
        toast.error("Failed to load analytics settings.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/developer-tools/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ section: "analytics", value: settings }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to save settings.");
        return;
      }
      toast.success("Analytics settings saved successfully.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
        <div className="mx-auto p-8">
          <DashboardHeader title="Analytics Tools" description="Configure tracking for the landing page." />
          <div className="mt-8 h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
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
            isSubmitting={isSubmitting}
          >
            <FormField label="Google Tag Manager Container ID" hint="Generate on Google Tag Manager">
              <input
                type="text"
                value={settings.googleTagManagerId ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, googleTagManagerId: e.target.value }))}
                placeholder="GTM-XXXXXXX"
                className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
              />
            </FormField>

            <FormField label="Google Analytics Measurement ID (GA4)" hint="Generate on Google Analytics">
              <input
                type="text"
                value={settings.googleAnalyticsId ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, googleAnalyticsId: e.target.value }))}
                placeholder="G-XXXXXXXXXX"
                className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
              />
            </FormField>

            <FormField label="Meta Pixel ID" hint="Generate on Facebook/Meta">
              <input
                type="text"
                value={settings.metaPixelId ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, metaPixelId: e.target.value }))}
                placeholder="123456789012345"
                className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
              />
            </FormField>

            <div className="flex flex-col gap-4">
              <FormField label="Enable Page View Tracking">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={settings.enablePageViewTracking ?? true}
                    onCheckedChange={(c) => setSettings((s) => ({ ...s, enablePageViewTracking: c === true }))}
                  />
                  <span className="text-sm">Track page views</span>
                </label>
              </FormField>

              <FormField label="Enable Lead Tracking">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={settings.enableLeadTracking ?? true}
                    onCheckedChange={(c) => setSettings((s) => ({ ...s, enableLeadTracking: c === true }))}
                  />
                  <span className="text-sm">Track form submissions and lead events</span>
                </label>
              </FormField>
            </div>
          </SettingsFormSection>
        </div>
      </div>
    </main>
  );
}
