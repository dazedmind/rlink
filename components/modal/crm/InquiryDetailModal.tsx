"use client";
import React, { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Globe, Mail, Phone, Printer, User } from "lucide-react";
import { inquirySource, inquirySubject } from "@/lib/types";
import { dateFormatter } from "@/app/utils/dateFormatter";

interface InquiryDetailModalProps {
  inquiry: { id: number; status: string; firstName: string; lastName: string; email: string; phone: string; subject: string; inquiryId?: string; createdAt: string; source: string; message: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: number, status: string) => void;
}

export function InquiryDetailModal({
  inquiry,
  isOpen,
  onClose,
  onStatusChange,
}: InquiryDetailModalProps) {
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to mark as read");
        return r.json();
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: qk.inquiries() });
      onStatusChange?.(id, "read");
    },
  });

  useEffect(() => {
    if (isOpen && inquiry?.id && inquiry?.status === "unread") {
      markReadMutation.mutate(inquiry.id);
    }
  }, [isOpen, inquiry?.id]);

  const handlePrint = () => window.print();
  const handleEmail = () => inquiry && (window.location.href = `mailto:${inquiry.email}`);

  if (!inquiry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-hidden p-0 flex flex-col border-none shadow-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="px-6 py-5 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-start w-full">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
                {inquirySubject[inquiry.subject as keyof typeof inquirySubject]}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-600">
                  {inquiry.inquiryId ?? `IN-${inquiry.id}`}
                </span>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span className="text-slate-700">
                    Sent on: {dateFormatter(inquiry.createdAt)}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Globe size={14} />
                    <span className="text-slate-700 capitalize">
                      From {inquirySource[inquiry.source as keyof typeof inquirySource] || inquiry.source}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 px-6 py-2 space-y-6">
          <div className="rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full aspect-square bg-primary/10 flex items-center justify-center text-primary">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {inquiry.firstName} {inquiry.lastName}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  <a href={`tel:${inquiry.phone}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
                    <Phone size={14} /> {inquiry.phone}
                  </a>
                  <a href={`mailto:${inquiry.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
                    <Mail size={14} /> {inquiry.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium uppercase">Message Content</p>
            <div className="bg-white border rounded-xl p-4 min-h-[200px] leading-relaxed text-slate-800">
              {inquiry.message}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-white flex flex-row justify-between items-center">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="size-4 mr-2" /> Print
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleEmail}>
              <Mail className="size-4 mr-2" /> Reply via Email
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
