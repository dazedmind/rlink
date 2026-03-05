"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Printer, Share, StickyNote } from "lucide-react";
import { ReservationStatus, reservationStatus } from "@/lib/types";
import DropSelect from "../../ui/DropSelect";
import { Field } from "../../ui/field";
import TextInput from "../../ui/TextInput";
import { toast } from "sonner";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";

interface ReservationDetailModalProps {
  reservation: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ReservationDetailModal({
  reservation,
  isOpen,
  onClose,
  onUpdate,
}: ReservationDetailModalProps) {
  const [status, setStatus] = useState<ReservationStatus>(
    reservation?.status ?? "",
  );
  const [project, setProject] = useState<string>(
    reservation?.projectName ?? "",
  );
  const [block, setBlock] = useState<string>(reservation?.block ?? "");
  const [lot, setLot] = useState<string>(reservation?.lot ?? "");
  const [notes, setNotes] = useState<string>(reservation?.notes ?? "");
  const [phone, setPhone] = useState<string>(reservation?.phone ?? "");
  const [email, setEmail] = useState<string>(reservation?.email ?? "");
  const [firstName, setFirstName] = useState<string>(
    reservation?.firstName ?? "",
  );
  const [lastName, setLastName] = useState<string>(reservation?.lastName ?? "");

  // Sync all fields when a different reservation is opened
  useEffect(() => {
    if (reservation) {
      setStatus(reservation.status ?? "");
      setProject(reservation.projectName ?? "");
      setBlock(reservation.block ?? "");
      setLot(reservation.lot ?? "");
      setNotes(reservation.notes ?? "");
      setPhone(reservation.phone ?? "");
      setEmail(reservation.email ?? "");
      setFirstName(reservation.firstName ?? "");
      setLastName(reservation.lastName ?? "");
    }
  }, [reservation?.id]);

  // Derive dirty state — button enables as soon as anything differs from original
  const isDirty =
    status    !== (reservation?.status      ?? "")   ||
    project   !== (reservation?.projectName ?? "")   ||
    String(block) !== String(reservation?.block ?? "") ||
    String(lot)   !== String(reservation?.lot   ?? "") ||
    notes     !== (reservation?.notes       ?? "")   ||
    phone     !== (reservation?.phone       ?? "")   ||
    email     !== (reservation?.email       ?? "")   ||
    firstName !== (reservation?.firstName   ?? "")   ||
    lastName  !== (reservation?.lastName    ?? "");

  // Block changed but user hasn't picked a lot yet — prevent a half-done update
  const lotSelectionPending = block !== "" && lot === "";

  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [inventoryList, setInventoryList] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjectsList = async () => {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjectsList(data);
    };
    fetchProjectsList();
  }, []);

  useEffect(() => {
    const fetchInventoryList = async () => {
      const response = await fetch("/api/projects/inventory");
      const data = await response.json();
      setInventoryList(data);
    };
    fetchInventoryList();
  }, []);

  const selectedProjectId =
    projectsList.find((p: any) => p.projectName === project)?.id ?? null;

  const projectInventoryItems = selectedProjectId
    ? inventoryList.filter((inv: any) => inv.projectId === selectedProjectId)
    : inventoryList;

  const uniqueBlocks = [
    ...new Set(projectInventoryItems.map((inv: any) => inv.block)),
  ];

  // Further filter by selected block so lots are block-specific
  const blockFilteredItems = block
    ? projectInventoryItems.filter(
        (inv: any) => String(inv.block) === String(block),
      )
    : projectInventoryItems;

  const uniqueLots = [
    ...new Set(blockFilteredItems.map((inv: any) => inv.lot)),
  ];

  // Lots occupied by OTHER reservations (exclude this reservation's own slot so it stays selectable)
  const reservedLots = blockFilteredItems.filter(
    (inv: any) => inv.soldTo !== null && inv.soldTo !== reservation?.id,
  );

  if (!reservation) return null;

  const handlePrint = () => window.print();
  const handleEmail = () => (window.location.href = `mailto:${email}`);

  const handleShare = () => {
    console.log("share");
  };

  const handleSubmitUpdate = async () => {
    try {
      const response = await fetch(`/api/reservation/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          projectName: project,
          block: block !== "" ? parseInt(block, 10) : undefined,
          lot:   lot   !== "" ? parseInt(lot,   10) : undefined,
          notes,
          phone,
          email,
          firstName,
          lastName,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to update reservation");
      }

      // Transfer inventory ownership only when block or lot actually changed
      const blockChanged = String(block) !== String(reservation.block ?? "");
      const lotChanged   = String(lot)   !== String(reservation.lot   ?? "");
      if (blockChanged || lotChanged) {
        await transferInventory();
      }

      toast.success("Reservation updated successfully");
      onClose();
      onUpdate();
    } catch (error) {
      console.error("[handleSubmitUpdate]", error);
      toast.error(error instanceof Error ? error.message : "Failed to update reservation");
    }
  };

  const transferInventory = async () => {
    const oldProjectId =
      projectsList.find((p: any) => p.projectName === reservation.projectName)?.id ?? null;
    const newProjectId = selectedProjectId;

    const oldInventory = inventoryList.find(
      (inv: any) =>
        String(inv.block) === String(reservation.block) &&
        String(inv.lot) === String(reservation.lot) &&
        inv.projectId === oldProjectId,
    );

    const newInventory = inventoryList.find(
      (inv: any) =>
        String(inv.block) === String(block) &&
        String(inv.lot) === String(lot) &&
        inv.projectId === newProjectId,
    );

    // Un-reserve the previous slot
    if (oldInventory) {
      const res = await fetch("/api/projects/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryCode: oldInventory.inventoryCode, soldTo: null }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn("Could not un-reserve old inventory:", err);
      }
    }

    // Reserve the new slot
    if (newInventory) {
      const res = await fetch("/api/projects/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryCode: newInventory.inventoryCode, soldTo: reservation.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to reserve new inventory slot.");
      }
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto p-0 scrollbar-hide border-none"
        showCloseButton={false}
      >
        <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b sticky top-0 bg-white z-10 sm:text-left">
          <div>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Reservation Details
            </DialogTitle>
            <p className="text-sm sm:text-md text-muted-foreground">
              Reservation ID: <span className="font-bold">{reservation.reservationId}</span>
            </p>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5 sm:gap-6 px-4 sm:px-6">
          {/* Client & Reservation Info */}
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="Client First Name"
                name="firstName"
                type="text"
                placeholder="Enter Client First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />

              <TextInput
                label="Client Last Name"
                name="lastName"
                type="text"
                placeholder="Enter Client Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />

              <TextInput
                label="Phone Number"
                name="phone"
                type="text"
                placeholder="Enter Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <TextInput
                label="Email"
                name="email"
                type="text"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <DropSelect
                label="Project"
                selectName="project"
                selectId="project"
                value={project}
                onChange={(e) => {
                  setProject(e.target.value);
                  setBlock("");
                  setLot("");
                }}
              >
                {projectsList.map((p: any) => (
                  <option key={p.id} value={p.projectName}>
                    {p.projectName} ({p.projectCode})
                  </option>
                ))}
              </DropSelect>

              <div className="grid grid-cols-2 gap-4">
                <DropSelect
                  label="Block Number"
                  selectName="block"
                  selectId="block"
                  value={String(block)}
                  onChange={(e) => {
                    setBlock(e.target.value);
                    setLot("");
                  }}
                >
                  {block === "" && (
                    <option value="" disabled>— Select block —</option>
                  )}
                  {uniqueBlocks.map((b) => (
                    <option key={String(b)} value={String(b)}>
                      {String(b)}
                    </option>
                  ))}
                </DropSelect>

                <DropSelect
                  label="Lot Number"
                  selectName="lot"
                  selectId="lot"
                  value={String(lot)}
                  onChange={(e) => setLot(e.target.value)}
                >
                  {lot === "" && (
                    <option value="" disabled>— Select lot —</option>
                  )}
                  {uniqueLots.map((l) => {
                    const isReserved = reservedLots.some(
                      (inv: any) => String(inv.lot) === String(l),
                    );

                    return (
                      <option
                        key={String(l)}
                        value={String(l)}
                        disabled={isReserved}
                        className={
                          isReserved ? "text-gray-400 bg-gray-100" : ""
                        }
                      >
                        {String(l)} {isReserved ? "(Reserved)" : ""}
                      </option>
                    );
                  })}
                </DropSelect>
              </div>

              <div className="col-span-full">
                <DropSelect
                  label="Status"
                  selectName="status"
                  selectId="status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as ReservationStatus)
                  }
                >
                  {Object.entries(reservationStatus).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </DropSelect>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Field>
              <Label htmlFor="notes" className="text-xs uppercase text-gray-500 flex items-center gap-2">
                <StickyNote className="size-4" />
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-50 border border-border text-sm resize-none p-3 rounded-lg w-full min-h-[100px]"
                placeholder="Add additional notes..."
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="size-4 mr-2" /> Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleEmail}>
              <Mail className="size-4 mr-2" /> Email
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="size-4 mr-2" /> Print
            </Button>
          </div>
        </div>

        <DialogFooter className="px-4 py-3 sm:px-6 sm:py-4 border-t sticky bottom-0 bg-white z-10 flex-row justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <Button
            disabled={!isDirty || lotSelectionPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubmitUpdate}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
