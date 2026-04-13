"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { toast } from "sonner";
import type { Article, ArticleType } from "@/lib/types";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { nameToSlug } from "@/app/utils/nameToSlug";
import ArticleBodyEditor from "./article-editor/ArticleBodyEditor";
import ArticleMetadataSidebar from "./article-editor/ArticleMetadataSidebar";
import BackButton from "@/components/ui/BackButton";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";

function getInitialState(article: Article | null) {
  if (article) {
    return {
      headline: article.headline ?? "",
      slug: article.slug ?? nameToSlug(article.headline ?? ""),
      body: article.body ?? "",
      publishDate: article.publishDate?.toString().slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      tags: Array.isArray(article.tags) ? article.tags : [] as string[],
      type: article.type ?? "news",
      photoUrl: article.photoUrl ?? "",
      isFeatured: article.isFeatured ?? false,
    };
  }
  return {
    headline: "",
    slug: "",
    body: "",
    publishDate: new Date().toISOString().slice(0, 10),
    tags: [] as string[],
    type: "news",
    photoUrl: "",
    isFeatured: false,
  };
}

export default function ArticleEditor({
  article,
  onSave,
  onCancel,
}: {
  article: Article | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!article;
  const containerRef = useRef<HTMLDivElement>(null);
  const initialState = getInitialState(article);

  const [headline, setHeadline] = useState(initialState.headline);
  const [slug, setSlug] = useState(initialState.slug);
  const [body, setBody] = useState(initialState.body);
  const [publishDate, setPublishDate] = useState(initialState.publishDate);
  const [tags, setTags] = useState<string[]>(initialState.tags);
  const [type, setType] = useState<ArticleType>(initialState.type as ArticleType);
  const [photoUrl, setPhotoUrl] = useState(initialState.photoUrl);
  const [isFeatured, setIsFeatured] = useState(initialState.isFeatured);
  const [mdTab, setMdTab] = useState<"write" | "preview">("write");

  const queryClient = useQueryClient();
  const { guard, release } = useSubmitGuard();

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      headline: string;
      slug: string;
      body: string;
      publishDate: string;
      tags: string[];
      type: ArticleType;
      photoUrl: string | null;
      isFeatured: boolean;
    }) => {
      const url = isEdit ? `/api/articles/${article!.id}` : "/api/articles";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Failed to ${isEdit ? "update" : "create"} article.`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.articles() });
      queryClient.invalidateQueries({ queryKey: qk.cmsDashboard() });
      toast.success(`Article ${isEdit ? "updated" : "created"} successfully!`);
      onSave();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Network error. Please try again.");
    },
  });

  useLayoutEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSubmit = () => {
    if (!headline.trim()) {
      toast.error("Headline is required.");
      return;
    }
    if (!body.trim()) {
      toast.error("Body is required.");
      return;
    }
    if (!publishDate) {
      toast.error("Publish date is required.");
      return;
    }

    if (!guard()) return;
    saveMutation.mutate(
      {
        headline: headline.trim(),
        slug: slug.trim() || nameToSlug(headline),
        body: body.trim(),
        publishDate,
        tags,
        type,
        photoUrl: photoUrl.trim() || null,
        isFeatured,
      },
      { onSettled: release },
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-6 animate-in fade-in duration-300"
    >
      <span className="flex items-center gap-4">
        <BackButton href="/home/cms/listings/news" mainPageName="News" onClick={onCancel} />
        <div className="flex-1">
          <DashboardHeader
            title="News and Articles Manager"
            description="Manage your news and articles and their contents."
          />
        </div>
      </span>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <ArticleBodyEditor
          body={body}
          setBody={setBody}
          mdTab={mdTab}
          setMdTab={setMdTab}
        />
        <ArticleMetadataSidebar
          headline={headline}
          setHeadline={setHeadline}
          slug={slug}
          setSlug={setSlug}
          type={type}
          setType={setType}
          publishDate={publishDate}
          setPublishDate={setPublishDate}
          tags={tags}
          setTags={setTags}
          photoUrl={photoUrl}
          setPhotoUrl={setPhotoUrl}
          isFeatured={isFeatured}
          setIsFeatured={setIsFeatured}
          isEdit={isEdit}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}
