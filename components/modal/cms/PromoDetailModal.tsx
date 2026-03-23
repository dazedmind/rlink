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
import { ExternalLink } from "lucide-react";
import type { Promo } from "@/lib/types";
import { promoStatusMeta } from "@/lib/types";
import Image from "next/image";

export default function PromoDetailModal({
  promo,
  isOpen,
  onClose,
}: {
  promo: Promo | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!promo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[calc(100%-2rem)] md:w-full flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-start justify-between gap-4 pr-6">
            <div>
              <DialogTitle className="text-lg">{promo.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${promoStatusMeta[promo.status]?.className}`}
                >
                  {promoStatusMeta[promo.status as keyof typeof promoStatusMeta]?.label}
                </span>
                {promo.startDate && (
                  <span className="text-xs text-muted-foreground">
                    {shortDateFormatter(promo.startDate)} –{" "}
                    {promo.endDate
                      ? shortDateFormatter(promo.endDate)
                      : "No end"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>


        <div className="flex-1 overflow-y-auto py-2 scrollbar-hide flex flex-col sm:flex-row gap-4">
          {promo.imageUrl && (
            <div className="rounded-lg aspect-square overflow-hidden bg-accent">
              <Image
                src={promo.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                width={500}
                height={500}
              />
            </div>
          )}

          {promo.description && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Description
              </p>
              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                {promo.description}
              </p>
            </div>
          )}

          {promo.linkUrl && (
            <a
              href={promo.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink size={14} />
              View link
            </a>
          )}
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t">
          <p className="text-xs text-muted-foreground mr-auto">
            Created {shortDateFormatter(promo.createdAt)}
          </p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
