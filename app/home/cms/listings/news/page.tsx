"use client";

import React, { useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { toast } from "sonner";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import ArticleDetailModal from "@/components/modal/cms/ArticleDetailModal";
import NewsTable from "@/components/tables/cms/NewsTable";
import type { Article } from "@/components/tables/cms/NewsTable";
import ArticleEditor from "@/components/layout/ArticleEditor";

function NewsManager() {
  const [view, setView] = useState<"table" | "editor">("table");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<Article | null>(null);
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDelete = async () => {
    if (!deletingArticle) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/articles/${deletingArticle.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to delete article.");
        return;
      }
      toast.success("Article deleted.");
      setDeletingArticle(null);
      setRefreshTrigger((t) => t + 1);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const goToEditor = (article: Article | null) => {
    setEditingArticle(article);
    setView("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exitEditor = () => {
    setView("table");
    setEditingArticle(null);
    setRefreshTrigger((t) => t + 1);
  };

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="News and Articles Manager"
          description="Manage your news and articles and their contents."
        />

        {view === "table" ? (
          <div className="flex flex-col gap-8 animate-in fade-in duration-500 mt-10">
            <NewsTable
              onEdit={goToEditor}
              onDelete={(a) => setDeletingArticle(a)}
              onView={(a) => setViewingArticle(a)}
              onAdd={() => goToEditor(null)}
              refreshTrigger={refreshTrigger}
            />
          </div>
        ) : (
          <div className="mt-10">
            <ArticleEditor
              article={editingArticle}
              onSave={exitEditor}
              onCancel={exitEditor}
            />
          </div>
        )}
      </div>

      <ArticleDetailModal
        article={viewingArticle}
        isOpen={!!viewingArticle}
        onClose={() => setViewingArticle(null)}
      />

      <DeleteConfirmModal
        isOpen={!!deletingArticle}
        onClose={() => setDeletingArticle(null)}
        onConfirm={handleDelete}
        itemName={deletingArticle?.headline ?? ""}
        isDeleting={isDeleting}
        title="Delete Article"
        confirmLabel="Delete Article"
      />
    </main>
  );
}

export default NewsManager;
