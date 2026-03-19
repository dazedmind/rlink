"use client";

import React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export function ReservationFormStep2({ onNext, onBack }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-center">
      <div className="border-2 border-dashed border-muted-foreground rounded-xl py-12 px-4 hover:border-blue-400 transition-colors cursor-pointer group">
        <Upload
          className="mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform"
          size={40}
        />
        <h3 className="text-lg font-medium">
          Click to upload or drag and drop
        </h3>
        <p className="text-muted-foreground text-sm">
          Proof of Reservation, IDs, or Legal Documents (PDF, PNG, JPG)
        </p>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} className="bg-blue-600 text-white px-8">
          Next Step
        </Button>
      </div>
    </div>
  );
}
