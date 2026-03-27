"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  FileText,
  Eye,
  Edit3,
  Mail,
  Clock,
  Check,
  Send,
  CircleDashed,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { renderMarkdown } from "@/app/utils/markdown";

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

const Divider = () => <span className="w-px h-5 bg-border mx-0.5" />;

export type ComposerCampaign = {
  id: number;
  name: string;
  subject: string;
  previewLine?: string;
  body?: string;
  status?: string;
};

type ComposerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** "create" = new campaign, "view" = same as edit but opens on Preview tab, "edit" = opens on Write tab */
  mode?: "create" | "view" | "edit";
  /** Campaign data for view/edit mode */
  campaign?: ComposerCampaign | null;
};

function ComposerModal({ isOpen, onClose, onSuccess, mode = "create", campaign }: ComposerModalProps) {
  const queryClient = useQueryClient();
  const defaultTab = mode === "view" ? "preview" : "write";
  const isEdit = mode === "edit" || mode === "view";
  const isCreate = mode === "create";

  const [form, setForm] = useState({ name: "", subject: "", preview: "", body: "", status: "" });
  const [tab, setTab] = useState<"write" | "preview">(defaultTab);
  const [schedulePopoverOpen, setSchedulePopoverOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (campaign) {
      setForm({
        name: campaign.name ?? "",
        subject: campaign.subject ?? "",
        preview: campaign.previewLine ?? "",
        body: campaign.body ?? "",
        status: campaign.status ?? "",
      });
      setTab(defaultTab);
    } else if (isCreate) {
      setForm({ name: "", subject: "", preview: "", body: "", status: "" });
      setTab("write");
    }
  }, [campaign, defaultTab, isCreate]);

  const buildScheduledAt = useCallback(() => {
    if (!scheduleDate) return undefined;
    const [h, m] = scheduleTime.split(":").map(Number);
    const d = new Date(scheduleDate);
    d.setHours(h ?? 10, m ?? 0, 0, 0);
    return d.toISOString();
  }, [scheduleDate, scheduleTime]);

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

  const submitCampaign = useCallback(
    async (status: "draft" | "scheduled" | "sent", scheduledAt?: string) => {
      if (!form.name.trim()) {
        toast.error("Campaign name is required");
        return;
      }
      if (!form.subject.trim()) {
        toast.error("Subject is required");
        return;
      }
      if (!form.body.trim()) {
        toast.error("Body is required");
        return;
      }
      if (status === "scheduled" && !scheduledAt) {
        toast.error("Please select a date and time");
        return;
      }

      setIsSubmitting(true);
      try {
        if (status === "sent" && isEdit && campaign) {
          const patchRes = await fetch(`/api/newsletter/campaigns/${campaign.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: form.name.trim(),
              subject: form.subject.trim(),
              previewLine: form.preview.trim(),
              body: form.body.trim(),
            }),
          });
          if (!patchRes.ok) {
            const d = await patchRes.json();
            throw new Error(d.error ?? "Failed to save changes");
          }
          const sendRes = await fetch(`/api/newsletter/campaigns/${campaign.id}/send`, {
            method: "POST",
            credentials: "include",
          });
          const data = await sendRes.json();
          if (!sendRes.ok) throw new Error(data.error ?? "Failed to send campaign");
          toast.success("Campaign sent successfully");
        } else {
          const payload = {
            name: form.name.trim(),
            subject: form.subject.trim(),
            previewLine: form.preview.trim(),
            body: form.body.trim(),
            status,
            ...(status === "scheduled" && scheduledAt && { scheduledAt: new Date(scheduledAt).toISOString() }),
          };

          const url = isEdit && campaign ? `/api/newsletter/campaigns/${campaign.id}` : "/api/newsletter/campaigns";
          const method = isEdit ? "PATCH" : "POST";

          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error ?? "Failed to save campaign");
          }

          const action =
            status === "draft" ? "saved as draft" : status === "scheduled" ? "scheduled" : "sent";
          toast.success(`Campaign ${action} successfully`);
        }

        setSchedulePopoverOpen(false);
        setScheduleDate(undefined);
        setScheduleTime("10:00");
        setForm({ name: "", subject: "", preview: "", body: "", status: "" });
        onClose();
        void queryClient.invalidateQueries({ queryKey: qk.newsletterCampaigns() });
        void queryClient.invalidateQueries({ queryKey: qk.newsletter() });
        onSuccess?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save campaign");
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, onClose, onSuccess, isEdit, campaign, queryClient]
  );

  const handleSaveDraft = () => submitCampaign("draft");

  const handleConfirmSchedule = () => {
    const scheduledAt = buildScheduledAt();
    if (!scheduledAt) {
      toast.error("Please select a date");
      return;
    }
    if (new Date(scheduledAt).getTime() <= Date.now()) {
      toast.error("Scheduled time must be in the future");
      return;
    }
    submitCampaign("scheduled", scheduledAt);
  };
  const handleSendNow = () => submitCampaign("sent");

  const statusBadge = {
    draft: "bg-slate-100 border-slate-200 border text-slate-700 p-1 px-3 rounded-full w-fit",
    scheduled: "bg-yellow-50 border-yellow-200 border text-yellow-700 p-1 px-3 rounded-full w-fit",
    sent: "bg-blue-50 border-blue-200 border text-blue-700 p-1 px-3 rounded-full w-fit",
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent 
        className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden gap-0"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 bg-accent">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground leading-none">
              {isEdit ? "Edit Campaign" : "New Campaign"}
            </DialogTitle>
          </DialogHeader>
          
          <span>
              {form.status && 
              <span className={`flex items-center gap-1 text-xs ${statusBadge[form.status as keyof typeof statusBadge]}`}>
                  {form.status === "draft" && <CircleDashed size={12} className="text-slate-700" />}
                  {form.status === "scheduled" && <Clock size={12} className="text-yellow-700" />}
                  {form.status === "sent" && <Check size={12} className="text-blue-700" />}
                  {form.status.toUpperCase()}
                </span>
              }
          </span>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex flex-col flex-1 overflow-y-auto px-6 py-4 gap-4 bg-background scrollbar-hide">
          {/* Static Fields */}
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-2.5 focus-within:border-blue-400 transition-colors">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16 shrink-0">Name</label>
              <input className="flex-1 text-sm text-muted-foreground bg-transparent focus:outline-none" placeholder="Campaign name (e.g. March Newsletter)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-2.5 focus-within:border-blue-400 transition-colors">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16 shrink-0">Subject</label>
              <input className="flex-1 text-sm text-muted-foreground bg-transparent focus:outline-none" placeholder="Enter email subject..." value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-2.5 focus-within:border-blue-400 transition-colors">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16 shrink-0">Preview</label>
              <input className="flex-1 text-sm text-muted-foreground bg-transparent focus:outline-none" placeholder="Short preview shown in inbox..." value={form.preview} onChange={(e) => setForm((f) => ({ ...f, preview: e.target.value }))} />
            </div>
          </div>

          {/* Editor Container */}
          <div className="flex flex-col flex-1 min-h-[400px] border border-border rounded-xl overflow-hidden transition-all bg-background mb-2">
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border bg-accent shrink-0 flex-wrap">
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

              <div className="ml-auto flex items-center bg-background rounded-lg p-0.5 gap-0.5">
                <button onClick={() => setTab("write")} className={`px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${tab === "write" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}><Edit3 size={12} /> Write</button>
                <button onClick={() => setTab("preview")} className={`px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${tab === "preview" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}><Eye size={12} /> Preview</button>
              </div>
            </div>

            {/* Editor Input Area */}
            <div className="flex-1 min-h-[200px] bg-background relative">
              {tab === "write" ? (
                <textarea
                  ref={textareaRef}
                  className="w-full h-full p-6 text-sm text-foreground focus:outline-none focus:ring-0 focus:border-0 resize-none font-mono leading-relaxed absolute inset-0"
                  placeholder="Start typing your campaign content..."
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                />
              ) : (
                <div
                  className="w-full h-full p-6 text-sm text-slate-800 overflow-y-auto absolute inset-0 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-pink-600 [&_code]:font-mono [&_code]:text-xs [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_p]:mb-3"
                  dangerouslySetInnerHTML={{
                    __html: form.body.trim()
                      ? renderMarkdown(form.body)
                      : '<p class="text-muted-foreground italic">Preview will appear here...</p>',
                  }}
                />
              )}
            </div>

            {/* Bottom Meta */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-accent text-[11px] text-muted-foreground shrink-0">
              <span className="flex items-center gap-1 font-medium"><FileText size={11} /> Markdown supported</span>
              <span className="font-medium">{wordCount} words</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-accent shrink-0">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground font-medium" disabled={isSubmitting}>Cancel</Button>
          
          <div className="flex gap-2">
            <Button variant="outline" className="text-foreground border-border font-medium" onClick={handleSaveDraft} disabled={isSubmitting}>
              Save as Draft
            </Button>

            <Popover open={schedulePopoverOpen} onOpenChange={setSchedulePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="text-foreground border-border font-medium gap-2" disabled={isSubmitting}>
                  <Clock size={14} /> Schedule Send
                  {scheduleDate && (
                    <span className="text-xs text-muted-foreground">
                      {format(scheduleDate, "MMM d")} {scheduleTime}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end" side="top" sideOffset={8}>
                <div className="p-4 space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Date</Label>
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Time</Label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setSchedulePopoverOpen(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" className="flex-1 bg-info hover:bg-info/90" onClick={handleConfirmSchedule}>
                      Schedule
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button className="bg-info hover:bg-info/90 text-white gap-2 px-6 font-semibold" onClick={handleSendNow} disabled={isSubmitting}>
              <Mail size={14} /> {isSubmitting ? "Sending…" : "Send Campaign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ComposerModal;