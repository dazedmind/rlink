"use client";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Table } from "lucide-react";
import LeadsTable from "@/components/tables/crm/LeadsTable";
import TextInput from "@/components/ui/TextInput";
import DropSelect from "@/components/ui/DropSelect";
import { toast } from "sonner";
import { leadSource, leadStatus, leadStage, leadNextAction } from "@/lib/types";
import type { Project } from "@/lib/types";

type FormData = {
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

const EMPTY_FORM: FormData = {
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
  const data = await res.json();
  return data;
};

function LeadGeneration() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"form" | "table">("form");
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const submitMutation = useMutation({
    mutationFn: (payload: FormData) =>
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
      setView("table");
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

  const handleSelectChange = (name: keyof FormData, value: string) => {
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
    submitMutation.mutate(formData);
  };

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Digital Sales Lead Tracker"
          description="Manage your sales leads and projects here."
        />

        <div className="flex justify-between items-center my-4">
          <div className="flex bg-[#F2F2F7] rounded-[10px] p-1 gap-1">
            {(["form", "table"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setView(t)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-[8px] text-[13px] font-medium capitalize transition-all duration-150 ${
                  view === t
                    ? "bg-primary text-white shadow-[0_1px_3px_rgba(0,0,0,0.10)]"
                    : "text-[#8E8E93] hover:text-[#1C1C1E]"
                }`}
              >
                {t === "form" ? <PlusCircle size={18} /> : <Table size={18} />}
                {t === "form" ? "New Lead" : "View Leads"}
              </button>
            ))}
          </div>
        </div>

        {view === "form" && (
          <div className="flex flex-col gap-8 rounded-xl p-6 bg-white border-border border animate-fade-in-up">
            <div>
              <h2 className="text-xl font-bold text-neutral-800 mb-4">
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
                  onChange={(e) =>
                    handleSelectChange("project", e.target.value)
                  }
                >
                  <option value="" disabled>Select Project</option>
                  {projects?.map((project: Project) => (
                    <option key={project.id} value={project.projectName}>
                      {project.projectName} ({project.projectCode})
                    </option>
                  ))}
                </DropSelect>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-neutral-800 mb-4">
                Lead Details
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                <DropSelect
                  label="Source"
                  selectName="source"
                  selectId="source"
                  onChange={(e) => handleSelectChange("source", e.target.value)}
                  className="col-span-2 md:col-span-1"
                >
                  <option value="" disabled>Select Source</option>
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
                  onChange={(e) => handleSelectChange("status", e.target.value)}
                  className="col-span-2 md:col-span-1"
                >
                  <option value="" disabled>Select Status</option>
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
                  onChange={(e) => handleSelectChange("stage", e.target.value)}
                  className="col-span-2 md:col-span-1"
                >
                  <option value="" disabled>Select Stage</option>
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
                  onChange={(e) =>
                    handleSelectChange("nextAction", e.target.value)
                  }
                  className="col-span-2 md:col-span-1"
                >
                  <option value="" disabled>Select Next Action</option>
                  {Object.entries(leadNextAction).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </DropSelect>
              </div>

              <div className="mt-4 space-y-1.5">
                <Label htmlFor="notes" className="text-xs text-neutral-600">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  placeholder="Add notes about this lead..."
                  onChange={handleInputChange}
                  className="border border-border text-sm resize-none min-h-[120px]"
                />
              </div>

              <span className="flex justify-end mt-4">
                <Button
                  onClick={handleSubmitLead}
                  disabled={submitMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Lead"}
                </Button>
              </span>
            </div>
          </div>
        )}

        {view === "table" && (
          <LeadsTable table_name="Leads Table" recentViewOnly={false} />
        )}
      </div>
    </main>
  );
}

export default LeadGeneration;
