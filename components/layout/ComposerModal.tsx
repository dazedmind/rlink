"use client";
import React, { useState, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  Quote,
  Code,
  Heading2,
  Minus,
  X,
  Send,
  FileText,
  Eye,
  Edit3,
} from "lucide-react";

// --- Polished Markdown preview renderer ---
function renderMarkdown(md: string): string {
  if (!md) return "";

  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/^### (.*$)/gm, "<h3 style='font-size: 18px; font-weight: 600;'>$1</h3>");
  html = html.replace(/^## (.*$)/gm, "<h2 style='font-size: 20px; font-weight: 600;'>$1</h2>");
  html = html.replace(/^# (.*$)/gm, "<h1 style='font-size: 24px; font-weight: 600;'>$1</h1>");
  html = html.replace(/^---$/gm, "<hr />");
  html = html.replace(/^&gt;[ ]?(.*$)/gm, "<blockquote>$1</blockquote>");

  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/~~(.*?)~~/g, "<s>$1</s>");
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 rounded text-pink-600 font-mono text-xs">$1</code>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-600 underline">$1</a>');

  html = html.replace(/^\-[ ]?(.*$)/gm, "<li>$1</li>");
  html = html.replace(/^\d+\.[ ]?(.*$)/gm, "<li>$1</li>");
  html = html.replace(/(<li>(?:.|\n)*?<\/li>)/g, '<ul class="list-disc pl-5 my-2">$1</ul>');
  html = html.replace(/<\/ul>\s*<ul class="list-disc pl-5 my-2">/g, "");

  return html
    .split(/\n\n+/)
    .map((para) => {
      const trimmed = para.trim();
      if (!trimmed) return "";
      if (/^<(h1|h2|h3|ul|li|blockquote|hr)/i.test(trimmed)) return trimmed;
      return `<p class="mb-3">${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
}

const ToolbarBtn = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
  >
    {children}
  </button>
);

const Divider = () => <span className="w-px h-5 bg-slate-200 mx-0.5" />;

function ComposerModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ subject: "", preview: "", body: "" });
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = useCallback((before: string, after: string = before) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = form.body.slice(start, end);
    const newBody = form.body.slice(0, start) + before + (selected || "text") + after + form.body.slice(end);
    setForm((f) => ({ ...f, body: newBody }));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + (selected || "text").length);
    }, 0);
  }, [form.body]);

  const prefixLines = useCallback((prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = form.body.slice(0, start);
    const selected = form.body.slice(start, end) || "item";
    const after = form.body.slice(end);
    const prefixed = selected.split("\n").map((l) => `${prefix}${l}`).join("\n");
    setForm((f) => ({ ...f, body: before + prefixed + after }));
    setTimeout(() => el.focus(), 0);
  }, [form.body]);

  const wordCount = form.body.trim() ? form.body.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-full max-h-[90vh] overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-semibold text-slate-900 leading-none">New Campaign</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form Body - We use flex-1 here to push the footer down */}
        <div className="flex flex-col flex-1 overflow-y-auto px-6 py-4 gap-4">
          
          {/* Static Fields */}
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-2.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-16 shrink-0">Subject</label>
              <input className="flex-1 text-sm text-slate-800 bg-transparent focus:outline-none" placeholder="Enter email subject..." value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-2.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-16 shrink-0">Preview</label>
              <input className="flex-1 text-sm text-slate-800 bg-transparent focus:outline-none" placeholder="Short preview shown in inbox..." value={form.preview} onChange={(e) => setForm((f) => ({ ...f, preview: e.target.value }))} />
            </div>
          </div>

          {/* Editor Container - We give this a large height to ensure the Write view is big */}
          <div className="flex flex-col flex-1 min-h-[500px] border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
            
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <ToolbarBtn title="Bold" onClick={() => wrapSelection("**")}><Bold size={14} /></ToolbarBtn>
              <ToolbarBtn title="Italic" onClick={() => wrapSelection("*")}><Italic size={14} /></ToolbarBtn>
              <ToolbarBtn title="Strikethrough" onClick={() => wrapSelection("~~")}><Strikethrough size={14} /></ToolbarBtn>
              <Divider />
              <ToolbarBtn title="Heading" onClick={() => prefixLines("## ")}><Heading2 size={14} /></ToolbarBtn>
              <ToolbarBtn title="Blockquote" onClick={() => prefixLines("> ")}><Quote size={14} /></ToolbarBtn>
              <ToolbarBtn title="Inline Code" onClick={() => wrapSelection("`")}><Code size={14} /></ToolbarBtn>
              <Divider />
              <ToolbarBtn title="Bulleted List" onClick={() => prefixLines("- ")}><List size={14} /></ToolbarBtn>
              <ToolbarBtn title="Numbered List" onClick={() => prefixLines("1. ")}><ListOrdered size={14} /></ToolbarBtn>
              <Divider />
              <ToolbarBtn title="Insert Link" onClick={() => wrapSelection("[", "](url)")}><Link2 size={14} /></ToolbarBtn>

              <div className="ml-auto flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                <button onClick={() => setTab("write")} className={`px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${tab === "write" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><Edit3 size={12} /> Write</button>
                <button onClick={() => setTab("preview")} className={`px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${tab === "preview" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><Eye size={12} /> Preview</button>
              </div>
            </div>

            {/* Editor Input Area */}
            <div className="flex-1 bg-white overflow-hidden relative">
              {tab === "write" ? (
                <textarea
                  ref={textareaRef}
                  className="w-full h-full p-6 text-sm text-slate-800 focus:outline-none focus:ring-0 focus:border-0 resize-none font-mono leading-relaxed absolute inset-0"
                  placeholder="Start typing your campaign content..."
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                />
              ) : (
                <div
                  className="w-full h-full p-6 text-sm text-slate-800 overflow-y-auto absolute inset-0 
                             prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4
                             prose-h2:text-xl prose-h2:font-bold prose-h2:mb-3
                             prose-blockquote:border-l-4 prose-blockquote:border-slate-200 prose-blockquote:pl-4 prose-blockquote:italic"
                  dangerouslySetInnerHTML={{
                    __html: form.body ? renderMarkdown(form.body) : '<p class="text-slate-300 italic">Preview will appear here...</p>',
                  }}
                />
              )}
            </div>

            {/* Bottom Meta */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-400 shrink-0">
              <span className="flex items-center gap-1 font-medium"><FileText size={11} /> Markdown supported</span>
              <span className="font-medium">{wordCount} words</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <Button variant="ghost" onClick={onClose} className="text-slate-500 font-medium">Cancel</Button>
          <div className="flex gap-2">
            <Button variant="outline" className="text-slate-700 border-slate-200 font-medium">Save as Draft</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-500/20 px-6 font-semibold"><Send size={14} /> Send Campaign</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComposerModal;