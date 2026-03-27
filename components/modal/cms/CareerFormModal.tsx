"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import TextInput from "@/components/ui/TextInput";
import DropSelect from "@/components/ui/DropSelect";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateAfterCmsCareerMutation } from "@/lib/cms/cms-invalidation";
import type { Career } from "@/lib/types";
import { careerStatus, department, location } from "@/lib/types";
import { nameToSlug } from "@/app/utils/nameToSlug";
import { Label } from "@/components/ui/label";

// ─── Field Label ──────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </Label>
  );
}

// ─── Career Form Modal ────────────────────────────────────────────────────────

type FormData = {
  position: string;
  slug: string;
  location: string;
  status: string;
  department: string;
  jobDescription: string;
  responsibilities: string;
  qualifications: string;
  requiredSkills: string;
};

const EMPTY_FORM: FormData = {
  position: "",
  slug: "",
  location: "",
  status: "hiring",
  department: "",
  jobDescription: "",
  responsibilities: "",
  qualifications: "",
  requiredSkills: "",
};

type Tab = "overview" | "details";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Job Details" },
];

export default function CareerFormModal({
  isOpen,
  onClose,
  onSuccess,
  career,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  career?: Career | null;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!career;
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (career) {
      setForm({
        position: career.position ?? "",
        slug: career.slug ?? nameToSlug(career.position ?? ""),
        location: career.location ?? "",
        status: career.status ?? "hiring",
        department: career.department ?? "",
        jobDescription: career.jobDescription ?? "",
        responsibilities: career.responsibilities ?? "",
        qualifications: career.qualifications ?? "",
        requiredSkills: career.requiredSkills ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setActiveTab("overview");
  }, [career, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "position" && !prev.slug) {
        next.slug = nameToSlug(value);
      }
      return next;
    });
  };

  const handleSelectChange = (name: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async () => {
    if (!form.position.trim()) {
      toast.error("Position is required.");
      setActiveTab("overview");
      return;
    }
    if (!form.location.trim()) {
      toast.error("Location is required.");
      setActiveTab("overview");
      return;
    }
    if (!form.jobDescription.trim()) {
      toast.error("Job description is required.");
      setActiveTab("details");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required.");
      setActiveTab("overview");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/careers/${career!.id}` : "/api/careers";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          position: form.position.trim(),
          slug: form.slug.trim() || nameToSlug(form.position),
          location: form.location.trim(),
          status: form.status,
          department: form.department,
          jobDescription: form.jobDescription.trim(),
          responsibilities: form.responsibilities.trim() || null,
          qualifications: form.qualifications.trim() || null,
          requiredSkills: form.requiredSkills.trim() || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(
          data.error ??
            `Failed to ${isEdit ? "update" : "create"} job posting.`,
        );
        return;
      }

      toast.success(
        `Job posting ${isEdit ? "updated" : "created"} successfully!`,
      );
      invalidateAfterCmsCareerMutation(queryClient);
      onSuccess();
      onClose();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {isEdit ? "Edit Job Posting" : "Add Job Posting"}
          </DialogTitle>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex bg-accent rounded-[10px] p-1 gap-1 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-[0_1px_3px_rgba(0,0,0,0.10)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto py-2 pr-0.5 scrollbar-hide">
          {/* Overview tab */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <TextInput
                  label="Position"
                  name="position"
                  type="text"
                  placeholder="e.g. Senior Sales Agent"
                  value={form.position}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <TextInput
                  label="Slug"
                  name="slug"
                  type="text"
                  placeholder="e.g. senior-sales-agent"
                  value={form.slug}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <DropSelect
                  label="Location"
                  selectName="location"
                  selectId="location"
                  value={form.location}
                  onChange={(e) => handleSelectChange("location", e.target.value)}
                >
                  <option value="" disabled>Select Location</option>
                  {Object.keys(location).map((key) => (
                    <option key={key} value={key}>
                      {location[key as keyof typeof location]}
                    </option>
                  ))}
                </DropSelect>
              </div>

              <div className="flex flex-col gap-1.5">
                <DropSelect
                  label="Department"
                  selectName="department"
                  selectId="department"
                  value={form.department}
                  onChange={(e) => handleSelectChange("department", e.target.value)}
                >
                  <option value="" disabled>Select Department</option>
                  {Object.keys(department).map((key) => (
                    <option key={key} value={key}>
                      {department[key as keyof typeof department]}
                    </option>
                  ))}
                </DropSelect>
              </div>

              <div className="flex flex-col gap-1.5">
                <DropSelect
                  label="Status"
                  selectName="status"
                  selectId="status"
                  value={form.status}
                  onChange={(e) => handleSelectChange("status", e.target.value)}
                >
                  {Object.entries(careerStatus).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </DropSelect>
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel>
                  Job Description <span className="text-red-500">*</span>
                </FieldLabel>
                <Textarea
                  name="jobDescription"
                  placeholder="Brief overview of the role..."
                  value={form.jobDescription}
                  onChange={handleInputChange}
                  className="min-h-28 resize-none"
                />
              </div>
            </div>
          )}

          {/* Details tab */}
          {activeTab === "details" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Responsibilities</FieldLabel>
                <Textarea
                  name="responsibilities"
                  placeholder="List the key responsibilities of this role..."
                  value={form.responsibilities}
                  onChange={handleInputChange}
                  className="min-h-28 resize-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  Tip: Use a new line for each responsibility.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel>Qualifications</FieldLabel>
                <Textarea
                  name="qualifications"
                  placeholder="Required education, experience, or certifications..."
                  value={form.qualifications}
                  onChange={handleInputChange}
                  className="min-h-24 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel>Required Skills</FieldLabel>
                <Textarea
                  name="requiredSkills"
                  placeholder="e.g. Communication, CRM tools, Negotiation..."
                  value={form.requiredSkills}
                  onChange={handleInputChange}
                  className="min-h-24 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
                ? "Save Changes"
                : "Add Posting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
