"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/ui/TextInput";
import DropSelect from "@/components/ui/DropSelect";
import { toast } from "sonner";
import {
  leadSource,
  leadStatus,
  leadStage,
  leadNextAction,
} from "@/lib/types";
import type { Project } from "@/lib/types";
import TextAreaField from "@/components/ui/TextAreaField";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";

export type LeadFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inquiryDate: string;
  profileLink: string;
  project: string;
  source: string;
  status: string;
  stage: string;
  nextAction: string;
  notes: string;
};

const today = new Date().toISOString().split("T")[0];

const EMPTY_FORM: LeadFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  inquiryDate: today,
  profileLink: "",
  project: "",
  source: "",
  status: "open",
  stage: "lead",
  nextAction: "call",
  notes: "",
};

const fetchProjects = async () => {
  const res = await fetch("/api/projects");
  return res.json();
};

type Props = {
  onSuccess?: () => void;
};

export function LeadGenerationForm({ onSuccess }: Props) {
  const queryClient = useQueryClient();
  const { guard, release } = useSubmitGuard();
  const [formData, setFormData] = useState<LeadFormData>(EMPTY_FORM);

  const { data: projects } = useQuery({
    queryKey: qk.projects(),
    queryFn: fetchProjects,
  });

  const submitMutation = useMutation({
    mutationFn: (payload: LeadFormData) =>
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to submit lead.");
        return data;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.leads() });
      toast.success("Lead submitted successfully!");
      setFormData(EMPTY_FORM);
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to submit lead.");
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitLead = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error("First name and last name are required.");
      return;
    }
    if (!formData.email && !formData.phone) {
      toast.error("Email or phone number is required.");
      return;
    }
    if (!formData.source) {
      toast.error("Please select a source.");
      return;
    }
    if (!guard()) return;
    submitMutation.mutate(formData, { onSettled: release });
  };

  return (
    <div className="flex flex-col gap-8 rounded-xl p-6 bg-background border-border border animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">
          Customer Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <TextInput
            label="First Name"
            name="firstName"
            type="text"
            placeholder="Enter First Name"
            className="col-span-2 md:col-span-1"
            onChange={handleInputChange}
            value={formData.firstName}
          />
          <TextInput
            label="Last Name"
            name="lastName"
            type="text"
            placeholder="Enter Last Name"
            className="col-span-2 md:col-span-1"
            onChange={handleInputChange}
            value={formData.lastName}
          />
          <TextInput
            label="Profile Link"
            name="profileLink"
            type="text"
            placeholder="https://..."
            className="col-span-2 md:col-span-1"
            onChange={handleInputChange}
            value={formData.profileLink}
          />
          <TextInput
            label="Email"
            name="email"
            type="email"
            placeholder="email@example.com"
            className="col-span-2 md:col-span-1"
            onChange={handleInputChange}
            value={formData.email}
          />
          <TextInput
            label="Phone"
            name="phone"
            type="tel"
            placeholder="(0960) 600-1234"
            className="col-span-2 md:col-span-1"
            onChange={handleInputChange}
            value={formData.phone}
          />
          <DropSelect
            className="col-span-2 md:col-span-1"
            label="Project"
            selectName="project"
            selectId="project"
            value={formData.project}
            onChange={(e) => handleSelectChange("project", e.target.value)}
          >
            <option value="" disabled>
              Select Project
            </option>
            {projects?.map((project: Project) => (
              <option key={project.id} value={project.projectName}>
                {project.projectName} ({project.projectCode})
              </option>
            ))}
          </DropSelect>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Lead Details
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <DropSelect
            label="Source"
            selectName="source"
            selectId="source"
            value={formData.source}
            onChange={(e) => handleSelectChange("source", e.target.value)}
            className="col-span-2 md:col-span-1"
          >
            <option value="" disabled>
              Select Source
            </option>
            {Object.entries(leadSource).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </DropSelect>
          <DropSelect
            label="Status"
            selectName="status"
            selectId="status"
            value={formData.status}
            onChange={(e) => handleSelectChange("status", e.target.value)}
            className="col-span-2 md:col-span-1"
          >
            <option value="" disabled>
              Select Status
            </option>
            {Object.entries(leadStatus).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </DropSelect>
          <DropSelect
            label="Stage"
            selectName="stage"
            selectId="stage"
            value={formData.stage}
            onChange={(e) => handleSelectChange("stage", e.target.value)}
            className="col-span-2 md:col-span-1"
          >
            <option value="" disabled>
              Select Stage
            </option>
            {Object.entries(leadStage).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </DropSelect>
          <DropSelect
            label="Next Action"
            selectName="nextAction"
            selectId="nextAction"
            value={formData.nextAction}
            onChange={(e) =>
              handleSelectChange("nextAction", e.target.value)
            }
            className="col-span-2 md:col-span-1"
          >
            <option value="" disabled>
              Select Next Action
            </option>
            {Object.entries(leadNextAction).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </DropSelect>
        </div>

        <div className="mt-4 space-y-1.5">
          <TextAreaField
            label="Notes"
            name="notes"
            value={formData.notes}
            placeholder="Add notes about this lead..."
            onChange={handleInputChange}
            className="col-span-2 md:col-span-1"
          />
        </div>

        <span className="flex justify-end mt-4">
          <Button
            onClick={handleSubmitLead}
            className="bg-primary hover:bg-primary/90 px-8"
          >
            Submit Lead
          </Button>
        </span>
      </div>
    </div>
  );
}
