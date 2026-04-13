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
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";

type SeoSettings = {
  defaultSiteTitle?: string;
  defaultMetaDescription?: string;
  defaultOgImageUrl?: string;
  canonicalBaseUrl?: string;
  robotsIndex?: boolean;
  sitemapGeneration?: boolean;
};

const DEFAULT_SEO: SeoSettings = {
  defaultSiteTitle: "",
  defaultMetaDescription: "",
  defaultOgImageUrl: "",
  canonicalBaseUrl: "",
  robotsIndex: true,
  sitemapGeneration: true,
};

const fetchSeoSettings = async () => {
  const res = await fetch("/api/developer-tools/settings?section=seo", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load SEO settings.");
  const json = await res.json();
  const data = json.data ?? {};
  return {
    defaultSiteTitle: data.defaultSiteTitle ?? "",
    defaultMetaDescription: data.defaultMetaDescription ?? "",
    defaultOgImageUrl: data.defaultOgImageUrl ?? "",
    canonicalBaseUrl: data.canonicalBaseUrl ?? "",
    robotsIndex: data.robotsIndex !== false,
    sitemapGeneration: data.sitemapGeneration !== false,
  };
};

const patchSettings = async (payload: {
  section: string;
  value: SeoSettings;
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

export default function SeoToolsPage() {
  const queryClient = useQueryClient();
  const { guard, release } = useSubmitGuard();
  const [settings, setSettings] = useState<SeoSettings>(DEFAULT_SEO);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: qk.developerToolsSettings("seo"),
    queryFn: fetchSeoSettings,
  });

  // All hooks must be called before any conditional returns
  React.useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  React.useEffect(() => {
    if (isError) toast.error("Failed to load SEO settings.");
  }, [isError]);

  const patchMutation = useMutation({
    mutationFn: patchSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.developerToolsSettings("seo") });
      toast.success("SEO settings saved successfully.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save settings.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guard()) return;
    patchMutation.mutate(
      { section: "seo", value: settings },
      { onSettled: release },
    );
  };

  // Conditional rendering after all hooks
  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
        <div className="mx-auto p-8">
          <DashboardHeader
            title="SEO Tools"
            description="Configure SEO settings for the landing page."
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
            title="SEO Tools"
            description="Configure SEO settings for the landing page."
          />
          <div className="mt-8 h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <p>Failed to load SEO settings.</p>
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
          title="SEO Tools"
          description="Configure SEO settings for the landing page. These settings are consumed by the public site."
        />

        <div className="mt-8 flex flex-col gap-8 animate-in fade-in duration-500">
          <SettingsFormSection
            title="SEO Configuration"
            description="Default meta tags and indexing behavior"
            icon={Search}
            onSubmit={handleSubmit}
          >
            <FormField
              label="Default Site Title"
              hint="Used as fallback when page-specific title is not set"
            >
              <input
                type="text"
                value={settings.defaultSiteTitle ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, defaultSiteTitle: e.target.value }))
                }
                placeholder="e.g. RLand - Real Estate"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring"
              />
            </FormField>

            <FormField
              label="Default Meta Description"
              hint="Shown in search results and social cards"
            >
              <textarea
                value={settings.defaultMetaDescription ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    defaultMetaDescription: e.target.value,
                  }))
                }
                placeholder="Brief description of your site"
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring resize-none"
              />
            </FormField>

            <FormField
              label="Default Open Graph Image URL"
              hint="Image shown when shared on social media"
            >
              <input
                type="url"
                value={settings.defaultOgImageUrl ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, defaultOgImageUrl: e.target.value }))
                }
                placeholder="https://example.com/og-image.jpg"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring"
              />
            </FormField>

            <FormField
              label="Canonical Base URL"
              hint="Base URL for canonical URLs (e.g. https://rland.ph)"
            >
              <input
                type="url"
                value={settings.canonicalBaseUrl ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, canonicalBaseUrl: e.target.value }))
                }
                placeholder="https://rland.ph"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring"
              />
            </FormField>

            <div className="flex flex-col gap-4">
              <FormField label="Robots Index">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={settings.robotsIndex ?? true}
                    onCheckedChange={(c) =>
                      setSettings((s) => ({ ...s, robotsIndex: c === true }))
                    }
                  />
                  <span className="text-sm text-foreground">
                    Allow search engines to index
                  </span>
                </label>
              </FormField>

              <FormField label="Sitemap Generation">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={settings.sitemapGeneration ?? true}
                    onCheckedChange={(c) =>
                      setSettings((s) => ({
                        ...s,
                        sitemapGeneration: c === true,
                      }))
                    }
                  />
                  <span className="text-sm text-foreground">
                    Enable automatic sitemap generation
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