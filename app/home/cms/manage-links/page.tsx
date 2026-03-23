"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import DashboardHeader from "@/components/layout/DashboardHeader";
import {
  SettingsFormSection,
  FormField,
} from "@/components/layout/forms/SettingsFormSection";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FaFacebook, FaTiktok, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa6";

type SocialLinks = {
  facebookUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
};

const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  facebookUrl: "",
  tiktokUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  linkedinUrl: "",
};

const fetchSocialLinks = async () => {
  const res = await fetch("/api/developer-tools/settings?section=social-links", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load social links.");
  const json = await res.json();
  const data = json.data ?? {};
  return {
    facebookUrl: data.facebookUrl ?? "",
    tiktokUrl: data.tiktokUrl ?? "",
    instagramUrl: data.instagramUrl ?? "",
    youtubeUrl: data.youtubeUrl ?? "",
    linkedinUrl: data.linkedinUrl ?? "",
  };
};

function SocialLinkInput({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <FormField label={`${label} URL`}>
      <div className="flex h-10 w-full items-center rounded-md border border-border bg-background px-3 focus-within:border-ring focus-within:ring focus-within:ring-ring/50 transition-[color,box-shadow]">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="ml-3 flex-1 min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
    </FormField>
  );
}

const patchSettings = async (payload: {
  section: string;
  value: SocialLinks;
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

export default function ManageLinksPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<SocialLinks>(DEFAULT_SOCIAL_LINKS);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: qk.developerToolsSettings("social-links"),
    queryFn: fetchSocialLinks,
  });

  React.useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  React.useEffect(() => {
    if (isError) toast.error("Failed to load social links.");
  }, [isError]);

  const patchMutation = useMutation({
    mutationFn: patchSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: qk.developerToolsSettings("social-links"),
      });
      toast.success("Social links saved successfully.");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    patchMutation.mutate({ section: "social-links", value: settings });
  };

  // Conditional rendering after all hooks
  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
        <div className="mx-auto p-8">
          <DashboardHeader
            title="Social Links"
            description="Configure social profile URLs for the landing page."
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
            title="Social Links"
            description="Configure social profile URLs for the landing page."
          />
          <div className="mt-8 h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <p>Failed to load social links.</p>
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
          title="Social Links"
          description="Configure social profile URLs for the landing page. Changes apply to the public site."
        />

        <div className="mt-8 flex flex-col gap-8 animate-in fade-in duration-500">
          <SettingsFormSection
            title="Manage Social Links"
            description="Public profile URLs for the landing page"
            // icon={BarChart3}
            onSubmit={handleSubmit}
            isSubmitting={patchMutation.isPending}
          >
            <SocialLinkInput
              label="Facebook"
              icon={FaFacebook}
              value={settings.facebookUrl ?? ""}
              onChange={(v) => setSettings((s) => ({ ...s, facebookUrl: v }))}
              placeholder="https://www.facebook.com/your-page"
            />
            <SocialLinkInput
              label="TikTok"
              icon={FaTiktok}
              value={settings.tiktokUrl ?? ""}
              onChange={(v) => setSettings((s) => ({ ...s, tiktokUrl: v }))}
              placeholder="https://www.tiktok.com/@your-page"
            />
            <SocialLinkInput
              label="Instagram"
              icon={FaInstagram}
              value={settings.instagramUrl ?? ""}
              onChange={(v) => setSettings((s) => ({ ...s, instagramUrl: v }))}
              placeholder="https://www.instagram.com/your-page"
            />
            <SocialLinkInput
              label="YouTube"
              icon={FaYoutube}
              value={settings.youtubeUrl ?? ""}
              onChange={(v) => setSettings((s) => ({ ...s, youtubeUrl: v }))}
              placeholder="https://www.youtube.com/your-page"
            />
            <SocialLinkInput
              label="LinkedIn"
              icon={FaLinkedin}
              value={settings.linkedinUrl ?? ""}
              onChange={(v) => setSettings((s) => ({ ...s, linkedinUrl: v }))}
              placeholder="https://www.linkedin.com/company/your-page"
            />
            </SettingsFormSection>
        </div>
      </div>
    </main>
  );
}
