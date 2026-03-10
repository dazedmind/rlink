"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import type { Article } from "@/components/tables/cms/NewsTable";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ArticleBodyEditor from "./article-editor/ArticleBodyEditor";
import ArticleMetadataSidebar from "./article-editor/ArticleMetadataSidebar";

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

  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [publishDate, setPublishDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [tags, setTags] = useState<string[]>([]);
  const [type, setType] = useState<"news" | "blog">("news");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mdTab, setMdTab] = useState<"write" | "preview">("write");

  useEffect(() => {
    if (article) {
      setHeadline(article.headline ?? "");
      setBody(article.body ?? "");
      setPublishDate(
        article.publishDate?.toString().slice(0, 10) ??
          new Date().toISOString().slice(0, 10)
      );
      setTags(Array.isArray(article.tags) ? article.tags : []);
      setType(article.type ?? "news");
      setPhotoUrl(article.photoUrl ?? "");
      setIsFeatured(article.isFeatured ?? false);
    } else {
      setHeadline("");
      setBody("");
      setPublishDate(new Date().toISOString().slice(0, 10));
      setTags([]);
      setType("news");
      setPhotoUrl("");
      setIsFeatured(false);
    }
  }, [article]);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSubmit = async () => {
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

    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/articles/${article!.id}` : "/api/articles";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          headline: headline.trim(),
          body: body.trim(),
          publishDate,
          tags,
          type,
          photoUrl: photoUrl.trim() || null,
          isFeatured,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(
          data.error ?? `Failed to ${isEdit ? "update" : "create"} article.`
        );
        return;
      }

      toast.success(`Article ${isEdit ? "updated" : "created"} successfully!`);
      onSave();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-6 animate-in fade-in duration-300"
    >
      <span className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft size={20} />
        </Button>
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
          isSubmitting={isSubmitting}
          isEdit={isEdit}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}
