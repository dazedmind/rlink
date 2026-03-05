"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { shortDateFormatter } from "@/app/utils/shortDateFormatter";
import type { Article } from "@/components/tables/cms/NewsTable";

export default function ArticleDetailModal({
  article,
  isOpen,
  onClose,
}: {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!article) return null;

  const typeMeta: Record<string, string> = {
    news: "News",
    blog: "Blog",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-start justify-between gap-4 pr-6">
            <div>
              <DialogTitle className="text-lg">{article.headline}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {typeMeta[article.type] ?? article.type}
                </span>
                {article.isFeatured && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    Featured
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {shortDateFormatter(article.publishDate)}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {article.photoUrl && (
          <div className="rounded-lg overflow-hidden border border-border h-48 bg-slate-50">
            <img
              src={article.photoUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2 scrollbar-hide flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Content
            </p>
            <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
              {article.body}
            </p>
          </div>

          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {article.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t">
          <p className="text-xs text-muted-foreground mr-auto">
            Created {shortDateFormatter(article.createdAt)}
          </p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
