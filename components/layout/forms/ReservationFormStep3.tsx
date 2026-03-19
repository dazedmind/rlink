"use client";

import React from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ReservationFormData } from "./ReservationFormStep1";

type Props = {
  formData: ReservationFormData;
  onBack: () => void;
  onComplete: () => void;
};

export function ReservationFormStep3({ formData, onBack, onComplete }: Props) {
  const handleSubmitReservation = async () => {
    try {
      const reservationRes = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, inventoryCode: getInventoryCode() }),
      });
      const reservationData = await reservationRes.json();

      if (!reservationRes.ok) {
        toast.error(reservationData.error ?? "Failed to submit reservation.");
        return;
      }

      const newReservationId: number = reservationData[0]?.id;
      await updateProjectInventory(newReservationId);

      toast.success("Reservation submitted successfully!");
      onComplete();
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  const getInventoryCode = () => {
    if (!formData.project || !formData.blockNumber || !formData.lotNumber) {
      return formData.inventoryCode;
    }
    return (
      formData.project
        .split(" ")
        .map((word: string) => word[0].toUpperCase())
        .join("") +
      "-" +
      formData.blockNumber +
      formData.lotNumber
    );
  };

  const updateProjectInventory = async (reservationId: number) => {
    const inventoryRes = await fetch("/api/projects/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inventoryCode: getInventoryCode(),
        soldTo: reservationId,
      }),
    });

    if (!inventoryRes.ok) {
      const err = await inventoryRes.json();
      throw new Error(err.error ?? "Failed to update inventory.");
    }
  };

  const inventoryCode =
    formData.inventoryCode ||
    (formData.project && formData.blockNumber && formData.lotNumber
      ? formData.project
          .split(" ")
          .map((word: string) => word[0].toUpperCase())
          .join("") +
        "-" +
        formData.blockNumber +
        formData.lotNumber
      : "No Inventory Code");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-foreground flex items-center gap-2 border-b pb-2">
          <FileText size={18} className="text-blue-600" /> Summary of Details
        </h3>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <span className="text-muted-foreground">Client Name:</span>
          <span className="font-medium">
            {formData.firstName} {formData.lastName}
          </span>
          <span className="text-muted-foreground">Inventory Code:</span>
          <span className="font-medium">{inventoryCode}</span>
          <span className="text-muted-foreground">Project:</span>
          <span className="font-medium">
            {formData.project || "Not Selected"}
          </span>
          <span className="text-muted-foreground">Location:</span>
          <span className="font-medium">
            Block {formData.blockNumber || "?"}, Lot {formData.lotNumber || "?"}
          </span>
          <span className="text-muted-foreground">Client Email:</span>
          <span className="font-medium">{formData.email || "N/A"}</span>
          <span className="text-muted-foreground">Recipient Email:</span>
          <span className="font-medium">
            {formData.recipientEmail || "N/A"}
          </span>
          <span className="text-muted-foreground">CC Email:</span>
          <span className="font-medium">{formData.ccEmail || "N/A"}</span>
          <span className="text-muted-foreground">BCC Email:</span>
          <span className="font-medium">{formData.bccEmail || "N/A"}</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleSubmitReservation}
          className="bg-success text-white px-10 py-3 rounded-lg font-bold hover:bg-success/90 shadow-lg shadow-success/10"
        >
          Confirm & Submit Reservation
        </Button>
      </div>
    </div>
  );
}
