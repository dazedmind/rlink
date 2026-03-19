"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { ArrowRight } from "lucide-react";
import DropSelect from "@/components/ui/DropSelect";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/ui/TextInput";
import { toast } from "sonner";
import TextAreaField from "@/components/ui/TextAreaField";

export interface ReservationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  project: string;
  inventoryCode: string;
  blockNumber: string;
  lotNumber: string;
  recipientEmail: string;
  ccEmail: string;
  bccEmail: string;
}

type Props = {
  formData: ReservationFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelect: (name: keyof ReservationFormData, value: string) => void;
  onNext: () => void;
};

export function ReservationFormStep1({
  formData,
  onChange,
  onSelect,
  onNext,
}: Props) {
  const [inventoryCode, setInventoryCode] = useState("");

  const { data: projectsList = [] } = useQuery({
    queryKey: qk.projects(),
    queryFn: async () => {
      const res = await fetch("/api/projects");
      return res.json();
    },
  });

  const { data: inventoryList = [] } = useQuery({
    queryKey: qk.projectInventory(),
    queryFn: async () => {
      const res = await fetch("/api/projects/inventory");
      return res.json();
    },
  });

  const selectedProjectId =
    projectsList.find((p: { projectName: string; id: string }) => p.projectName === formData.project)
      ?.id ?? null;

  const projectInventoryItems = selectedProjectId
    ? inventoryList.filter(
        (inv: { projectId: string }) => inv.projectId === selectedProjectId,
      )
    : inventoryList;

  const uniqueBlocks = [
    ...new Set(projectInventoryItems.map((inv: { block: string }) => inv.block)),
  ];

  const blockFilteredItems = formData.blockNumber
    ? projectInventoryItems.filter(
        (inv: { block: string }) => String(inv.block) === String(formData.blockNumber),
      )
    : projectInventoryItems;

  const uniqueLots = [
    ...new Set(blockFilteredItems.map((inv: { lot: string }) => inv.lot)),
  ];

  const reservedLots = blockFilteredItems.filter(
    (inv: { soldTo: unknown }) => inv.soldTo !== null,
  );

  useEffect(() => {
    if (formData.project && formData.blockNumber && formData.lotNumber) {
      const code =
        formData.project
          .split(" ")
          .map((word: string) => word[0].toUpperCase())
          .join("") +
        "-" +
        formData.blockNumber +
        formData.lotNumber;
      setInventoryCode(code);
    }
  }, [formData.project, formData.blockNumber, formData.lotNumber]);

  const handleNext = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.project ||
      !formData.blockNumber ||
      !formData.lotNumber
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h3 className="text-xl font-bold mb-4 text-foreground">
          Customer Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="Client First Name"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={onChange}
            placeholder="John"
          />
          <TextInput
            label="Client Last Name"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={onChange}
            placeholder="Doe"
          />
          <TextInput
            label="Client Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            placeholder="john@example.com"
          />
          <TextInput
            label="Client Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={onChange}
            placeholder="(0960) 600-1234"
          />
          <DropSelect
            label="Project"
            selectName="project"
            selectId="project"
            value={formData.project}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              onSelect("project", e.target.value);
              onSelect("blockNumber", "");
              onSelect("lotNumber", "");
            }}
          >
            <option value="">Select Project</option>
            {projectsList.map((p: { id: string; projectName: string; projectCode: string }) => (
              <option key={p.id} value={p.projectName}>
                {p.projectName} ({p.projectCode})
              </option>
            ))}
          </DropSelect>
          <span className="flex gap-2">
            <DropSelect
              label="Block"
              selectName="blockNumber"
              selectId="blockNumber"
              value={String(formData.blockNumber)}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                onSelect("blockNumber", e.target.value);
                onSelect("lotNumber", "");
              }}
            >
              <option value="">Select Block</option>
              {uniqueBlocks.map((b) => (
                <option key={String(b)} value={String(b)}>
                  {String(b)}
                </option>
              ))}
            </DropSelect>
            <DropSelect
              label="Lot"
              selectName="lotNumber"
              selectId="lotNumber"
              value={String(formData.lotNumber)}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onSelect("lotNumber", e.target.value)
              }
            >
              <option value="">Select Lot</option>
              {uniqueLots.map((l) => {
                const isReserved = reservedLots.some(
                  (inv: { lot: string }) => inv.lot === l,
                );
                return (
                  <option
                    key={String(l)}
                    value={String(l)}
                    disabled={isReserved}
                    className={isReserved ? "text-muted-foreground bg-accent" : ""}
                  >
                    {String(l)} {isReserved ? "(Reserved)" : ""}
                  </option>
                );
              })}
            </DropSelect>
          </span>
          <input
            type="text"
            name="inventoryCode"
            id="inventoryCode"
            value={inventoryCode}
            className="hidden"
            readOnly
          />
        </div>
        <div className="mt-4 space-y-1.5">
          <TextAreaField
            label="Notes"
            name="notes"
            value={formData.notes}
            placeholder="Add additional notes..."
            onChange={onChange}
            className="col-span-2 md:col-span-1"
          />
        </div>
      </section>

      <section className="pt-6 border-t border-border">
        <h3 className="text-xl font-bold mb-4 text-foreground">
          Send Email Section
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="Recipient Email"
            name="recipientEmail"
            type="email"
            value={formData.recipientEmail}
            onChange={onChange}
            placeholder="recipient@email.com"
          />
          <TextInput
            label="CC Email"
            name="ccEmail"
            type="email"
            value={formData.ccEmail}
            onChange={onChange}
            placeholder="cc@email.com"
          />
          <TextInput
            label="BCC Email"
            name="bccEmail"
            type="email"
            value={formData.bccEmail}
            onChange={onChange}
            placeholder="bcc@email.com"
          />
        </div>
      </section>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          className="bg-blue-600 text-white px-8 flex items-center gap-2"
        >
          Next Step <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
