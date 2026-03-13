"use client";

import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { SettingsFormSection, FormField } from "@/components/layout/forms/SettingsFormSection";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";
import { toast } from "sonner";

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

export default function SecurityToolsPage() {
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SECURITY);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/developer-tools/settings?section=security", {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          const data = json.data ?? {};
          setSettings({
            recaptchaSiteKey: data.recaptchaSiteKey ?? "",
            enableRecaptcha: data.enableRecaptcha === true,
            honeypotEnabled: data.honeypotEnabled !== false,
            allowedEmbedDomains: Array.isArray(data.allowedEmbedDomains)
              ? data.allowedEmbedDomains.join("\n")
              : (data.allowedEmbedDomains ?? ""),
          });
        }
      } catch {
        toast.error("Failed to load security settings.");
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
      const domains = settings.allowedEmbedDomains
        ?.split("\n")
        .map((d) => d.trim())
        .filter(Boolean) ?? [];
      const res = await fetch("/api/developer-tools/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          section: "security",
          value: {
            recaptchaSiteKey: settings.recaptchaSiteKey ?? "",
            enableRecaptcha: settings.enableRecaptcha ?? false,
            honeypotEnabled: settings.honeypotEnabled ?? true,
            allowedEmbedDomains: domains,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to save settings.");
        return;
      }
      toast.success("Security settings saved successfully.");
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
          <DashboardHeader title="Security Tools" description="Configure security for the landing page." />
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
          title="Security Tools"
          description="Configure reCAPTCHA, honeypot, and embed domain restrictions for the landing page."
        />

        <div className="mt-8 flex flex-col gap-8 animate-in fade-in duration-500">
          <SettingsFormSection
            title="Security Configuration"
            description="Form protection and embed restrictions"
            icon={Shield}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          >
            <FormField label="Google reCAPTCHA Site Key" hint="Public site key from Google reCAPTCHA admin">
              <input
                type="text"
                value={settings.recaptchaSiteKey ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, recaptchaSiteKey: e.target.value }))}
                placeholder="6Lc..."
                className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
              />
            </FormField>

            <FormField label="Enable reCAPTCHA for forms">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={settings.enableRecaptcha ?? false}
                  onCheckedChange={(c) => setSettings((s) => ({ ...s, enableRecaptcha: c === true }))}
                />
                <span className="text-sm">Require reCAPTCHA verification on form submissions</span>
              </label>
            </FormField>

            <FormField label="Honeypot spam protection">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={settings.honeypotEnabled ?? true}
                  onCheckedChange={(c) => setSettings((s) => ({ ...s, honeypotEnabled: c === true }))}
                />
                <span className="text-sm">Use honeypot field to catch bots</span>
              </label>
            </FormField>

            <FormField
              label="Allowed embed domains"
              hint="One domain per line. Iframes/embeds from other domains will be blocked."
            >
              <textarea
                value={settings.allowedEmbedDomains ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, allowedEmbedDomains: e.target.value }))}
                placeholder="youtube.com&#10;vimeo.com&#10;maps.google.com"
                rows={5}
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring resize-none font-mono"
              />
            </FormField>
          </SettingsFormSection>
        </div>
      </div>
    </main>
  );
}
