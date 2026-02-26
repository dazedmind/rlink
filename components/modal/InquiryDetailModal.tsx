"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, Globe, Mail, Printer } from "lucide-react";
import { InquiryStatus, inquirySource, inquirySubject } from "@/lib/types";
import { dateFormatter } from "@/app/utils/dateFormatter";

interface InquiryDetailModalProps {
  inquiry: any;
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
  const [status, setStatus] = useState<InquiryStatus>(inquiry?.status);
  const [notes, setNotes] = useState<string>(inquiry?.notes);

  useEffect(() => {
    if (isOpen && inquiry?.id && inquiry?.status === "unread") {
      fetch(`/api/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      })
        .then(() => {
          setStatus("Read");
          onStatusChange?.(inquiry.id, "read");
        })
        .catch(console.error);
    }
  }, [isOpen, inquiry?.id]);

  const handlePrint = () => window.print();
  const handleEmail = () => (window.location.href = `mailto:${inquiry.email}`);

  if (!inquiry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-2/3 overflow-y-auto" showCloseButton={false}>
        <DialogHeader className="border-b pb-4 flex flex-row justify-between items-center">
          <div>
            <DialogTitle className="text-2xl font-bold">
              {inquirySubject[inquiry.subject as keyof typeof inquirySubject]}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Left Column: Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase text-gray-500">
                    Client Name
                  </Label>
                  <p className="font-bold text-lg">
                    {inquiry.firstName} {inquiry.lastName}
                  </p>
                  <p className="text-sm">{inquiry.phone}</p>
                  <p className="text-sm">{inquiry.email}</p>
                </div>
                <div>
                  <Label className="text-xs uppercase text-gray-500">
                    Subject
                  </Label>
                  <p className="text-md">
                    {
                      inquirySubject[
                        inquiry.subject as keyof typeof inquirySubject
                      ]
                    }
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div>
                  <span className="flex text-xs gap-1 text-gray-500">
                    <Globe className="size-4" />{" "}
                    <p className="font-medium">
                      {
                        inquirySource[
                          inquiry.source as keyof typeof inquirySource
                        ]
                      }
                    </p>
                  </span>
                </div>
                <div>
                  <span className="flex text-xs gap-1 text-gray-500">
                    <Calendar className="size-4" />{" "}
                    <p className="font-medium">
                      {dateFormatter(inquiry.createdAt)}
                    </p>
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase text-gray-500 mb-1.5">
                  Message
                </Label>
                <p className=" text-base p-2 bg-neutral-50 rounded-md">
                  {inquiry.message}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 flex flex-row justify-between items-center">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="size-4 mr-2" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleEmail}>
            <Mail className="size-4 mr-2" /> Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
