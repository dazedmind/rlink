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
import { LeadStatus } from "@/lib/types";
import TextInput from "../ui/TextInput";
import { toast } from "sonner";
import DropSelect from "../ui/DropSelect";
import { StickyNote } from "lucide-react";
import { Separator } from "../ui/separator";
import { Field } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

const SOURCE_OPTIONS = [
  { value: "ads", label: "Ads" },
  { value: "organic_fb", label: "Organic - FB" },
  { value: "organic_ig", label: "Organic - IG" },
  { value: "tiktok", label: "Organic - TikTok" },
  { value: "website", label: "Website" },
  { value: "email", label: "Email" },
];

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "ongoing", label: "In Progress" },
  { value: "follow_up", label: "Follow-Up Needed" },
  { value: "no_response", label: "No Response" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "ineligible", label: "Not Qualified" },
];

const STAGE_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "qualified", label: "Qualified" },
  { value: "presented", label: "Presentation Completed" },
  { value: "viewed", label: "Viewing Completed" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
];

const NEXT_ACTION_OPTIONS = [
  { value: "call", label: "Call Client" },
  { value: "message", label: "Send Message" },
  { value: "email", label: "Send Email" },
  { value: "followup", label: "Follow Up" },
  { value: "schedule_presentation", label: "Schedule Presentation" },
  { value: "tripping", label: "Schedule Viewing / Tripping" },
  { value: "computation", label: "Send Proposal / Computation" },
  { value: "reservation", label: "Reservation Processing" },
  { value: "documentation", label: "Documentation Processing" },
];

interface LeadDetailModalProps {
  lead: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function LeadDetailModal({
  lead,
  isOpen,
  onClose,
  onUpdate,
}: LeadDetailModalProps) {
  const [status, setStatus] = useState<LeadStatus>(lead?.status ?? "");
  const [project, setProject] = useState<string>(lead?.project ?? "");
  const [notes, setNotes] = useState<string>(lead?.notes ?? "");
  const [phone, setPhone] = useState<string>(lead?.phone ?? "");
  const [email, setEmail] = useState<string>(lead?.email ?? "");
  const [firstName, setFirstName] = useState<string>(lead?.firstName ?? "");
  const [lastName, setLastName] = useState<string>(lead?.lastName ?? "");
  const [stage, setStage] = useState<string>(lead?.stage ?? "");
  const [nextAction, setNextAction] = useState<string>(lead?.nextAction ?? "");
  const [profileLink, setProfileLink] = useState<string>(lead?.profileLink ?? "");
  const [source, setSource] = useState<string>(lead?.source ?? "");

  useEffect(() => {
    if (lead) {
      setStatus(lead.status ?? "");
      setProject(lead.project ?? "");
      setNotes(lead.notes ?? "");
      setPhone(lead.phone ?? "");
      setEmail(lead.email ?? "");
      setFirstName(lead.firstName ?? "");
      setLastName(lead.lastName ?? "");
      setStage(lead.stage ?? "");
      setNextAction(lead.nextAction ?? "");
      setProfileLink(lead.profileLink ?? "");
      setSource(lead.source ?? "");
    }
  }, [lead?.id]);

  const isDirty =
    status !== (lead?.status ?? "") ||
    project !== (lead?.project ?? "") ||
    notes !== (lead?.notes ?? "") ||
    phone !== (lead?.phone ?? "") ||
    email !== (lead?.email ?? "") ||
    firstName !== (lead?.firstName ?? "") ||
    lastName !== (lead?.lastName ?? "") ||
    stage !== (lead?.stage ?? "") ||
    nextAction !== (lead?.nextAction ?? "") ||
    source !== (lead?.source ?? "");

  const handleSubmitUpdate = async () => {
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status as LeadStatus,
          project,
          notes,
          phone,
          email,
          firstName,
          lastName,
          stage,
          nextAction,
          profileLink: profileLink,
          source,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to update lead");
      }
      toast.success("Lead updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update lead");
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
              Lead Details
            </DialogTitle>
            <p className="text-sm sm:text-md text-muted-foreground">
              Lead ID: <span className="font-bold">{lead?.leadId}</span>
            </p>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5 sm:gap-6 px-4 sm:px-6">
          {/* CLIENT INFORMATION */}
          <section className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-4">
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 whitespace-nowrap shrink-0">
                Client Information
              </h1>
              <Separator className="flex-1" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <TextInput
                label="Client First Name"
                name="firstName"
                type="text"
                placeholder="Enter First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextInput
                label="Client Last Name"
                name="lastName"
                type="text"
                placeholder="Enter Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <TextInput
                label="Client Email"
                name="email"
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                label="Profile Link"
                name="profileLink"
                type="text"
                placeholder="https://..."
                value={profileLink}
                onChange={(e) => setProfileLink(e.target.value)}
              />
              <DropSelect
                label="Source"
                selectName="source"
                selectId="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </DropSelect>
            </div>
          </section>

          {/* LEAD DETAILS */}
          <section className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-4">
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 whitespace-nowrap shrink-0">
                Lead Details
              </h1>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <DropSelect
                label="Project"
                selectName="project"
                selectId="project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
              >
                <option value="">Select Project</option>
                <option value="Arcoe Residences">Arcoe Residences</option>
                <option value="Arcoe Estates">Arcoe Estates</option>
              </DropSelect>

              <DropSelect
                label="Status"
                selectName="status"
                selectId="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </DropSelect>

              <DropSelect
                label="Stage"
                selectName="stage"
                selectId="stage"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              >
                {STAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </DropSelect>

              <DropSelect
                label="Next Action"
                selectName="nextAction"
                selectId="nextAction"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
              >
                {NEXT_ACTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </DropSelect>
            </div>

            <Field className="space-y-2">
              <Label htmlFor="notes" className="text-xs uppercase text-gray-500 flex items-center gap-2">
                <StickyNote className="size-4" />
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-50 border-border text-sm resize-none p-3 rounded-lg w-full h-[100px]"
                placeholder="Add additional notes..."
              />
            </Field>
          </section>
        </div>

        <DialogFooter className="px-4 py-3 sm:px-6 sm:py-4 border-t sticky bottom-0 bg-white z-10 flex-row justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            disabled={!isDirty}
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmitUpdate}
          >
            Update Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}