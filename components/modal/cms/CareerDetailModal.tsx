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
import { MapPin } from "lucide-react";
import { Career } from "@/lib/types";

const careerStatus = {
  hiring: "Hiring",
  closed: "Closed",
  archived: "Archived",
} as const;

export default function CareerDetailModal({
    career,
    isOpen,
    onClose,
  }: {
    career: Career | null;
    isOpen: boolean;
    onClose: () => void;
  }) {
    if (!career) return null;
  
    const sections: { label: string; content: string }[] = [
      { label: "Job Description",   content: career.jobDescription   },
      { label: "Purpose",           content: career.purpose          },
      { label: "Responsibilities",  content: career.responsibilities  },
      { label: "Qualifications",    content: career.qualifications    },
      { label: "Required Skills",   content: career.requiredSkills   },
    ].filter((s) => s.content?.trim());
  
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <div className="flex items-start justify-between gap-4 pr-6">
              <div>
                <DialogTitle className="text-lg">{career.position}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={11} /> {career.location}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${career.status === careerStatus.hiring.toLowerCase() ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : career.status === careerStatus.closed.toLowerCase() ? "bg-slate-100 text-slate-600 border border-slate-200" : "bg-red-50 text-red-400 border border-red-100"}`}>
                    {careerStatus[career.status as keyof typeof careerStatus]}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
  
          <div className="flex-1 overflow-y-auto py-2 scrollbar-hide flex flex-col gap-5">
          {sections.map((s) => {
            const lines = s.content.split("\n").map((l) => l.trim()).filter(Boolean);
            return (
              <div key={s.label} className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {s.label}
                </p>
                {lines.length > 1 ? (
                  <ul className="flex flex-col gap-1">
                    {lines.map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-primary mt-2" />
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-foreground leading-relaxed">{s.content}</p>
                )}
              </div>
            );
          })}
        </div>
  
          <DialogFooter className="shrink-0 pt-3 border-t">
            <p className="text-xs text-muted-foreground mr-auto">
              Posted {shortDateFormatter(career.createdAt)}
            </p>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  