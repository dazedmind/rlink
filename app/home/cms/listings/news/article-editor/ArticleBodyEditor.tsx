"use client";

import React, { useRef, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { marked } from "marked";
import MarkdownToolbar from "./MarkdownToolbar";

type ArticleBodyEditorProps = {
  body: string;
  setBody: (value: string) => void;
  mdTab: "write" | "preview";
  setMdTab: (tab: "write" | "preview") => void;
};

export default function ArticleBodyEditor({
  body,
  setBody,
  mdTab,
  setMdTab,
}: ArticleBodyEditorProps) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = useCallback(
    (
      fn: (
        v: string,
        s: number,
        e: number
      ) => { newValue: string; newStart: number; newEnd: number }
    ) => {
      const ta = bodyRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const { newValue, newStart, newEnd } = fn(body, start, end);
      setBody(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(newStart, newEnd);
      });
    },
    [body, setBody]
  );

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;
  const htmlPreview = body.trim()
    ? (marked.parse(body.trim(), { gfm: true, breaks: true }) as string)
    : "";

  return (
    <div className="xl:col-span-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
            Article Body <span className="text-destructive">*</span>
          </Label>
        </div>
        <div className="flex bg-accent rounded-[10px] p-1 gap-1">
          <button
            type="button"
            onClick={() => setMdTab("write")}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all duration-150 cursor-pointer ${
              mdTab === "write"
                ? "bg-primary text-white shadow-[0_1px_3px_rgba(0,0,0,0.10)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setMdTab("preview")}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all duration-150 cursor-pointer ${
              mdTab === "preview"
                ? "bg-primary text-white shadow-[0_1px_3px_rgba(0,0,0,0.10)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {mdTab === "write" ? (
        <>
          <MarkdownToolbar applyFormat={applyFormat} />
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your article content in Markdown..."
            className="min-h-[500px] w-full rounded-md border border-border bg-transparent px-4 py-3 text-sm font-mono resize-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 placeholder:text-muted-foreground"
          />
        </>
      ) : (
        <div
          className="min-h-[500px] w-full rounded-md border border-border bg-transparent px-4 py-3 text-sm overflow-auto [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_p]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-0.5 [&_strong]:font-semibold [&_em]:italic"
          dangerouslySetInnerHTML={{ __html: htmlPreview }}
        />
      )}

      <p className="text-xs text-muted-foreground">
        {charCount} characters · {wordCount} words
      </p>
    </div>
  );
}
