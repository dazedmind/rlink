"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { toast } from "sonner";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import NewsTable from "@/components/tables/cms/NewsTable";
import ArticleEditor from "@/app/home/cms/listings/news/ArticleEditor";
import { Article } from "@/lib/types";

function NewsManager() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"table" | "editor">("table");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<Article | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/articles/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to delete article.");
        }
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.articles() });
      toast.success("Article deleted.");
      setDeletingArticle(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete article.");
    },
  });

  const handleDelete = () => {
    if (!deletingArticle) return;
    deleteMutation.mutate(deletingArticle.id);
  };

  const goToEditor = (article: Article | null) => {
    setEditingArticle(article);
    setView("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exitEditor = () => {
    setView("table");
    setEditingArticle(null);
    queryClient.invalidateQueries({ queryKey: qk.articles() });
  };

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
      <div className="mx-auto p-8">

        {view === "table" ? (
          <>
            <DashboardHeader
              title="News and Articles Manager"
              description="Manage your news and articles and their contents."
            />
            <div className="flex flex-col gap-8 animate-in fade-in duration-500 mt-10">
              <NewsTable
                onEdit={goToEditor}
                onDelete={(a) => setDeletingArticle(a)}
                onView={goToEditor}
                onAdd={() => goToEditor(null)}
              />
            </div>
          </>

        ) : (
          <div>
            <ArticleEditor
              key={editingArticle?.id ?? "new"}
              article={editingArticle}
              onSave={exitEditor}
              onCancel={exitEditor}
            />
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={!!deletingArticle}
        onClose={() => setDeletingArticle(null)}
        onConfirm={handleDelete}
        itemName={deletingArticle?.headline ?? ""}
        isDeleting={deleteMutation.isPending}
        title="Delete Article"
        confirmLabel="Delete Article"
      />
    </main>
  );
}

export default NewsManager;
