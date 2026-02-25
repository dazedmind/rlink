"use client";
import React, { useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Table } from "lucide-react";
import LeadsTable from "@/components/layout/LeadsTable";
import TextInput from "@/components/ui/TextInput";
import DropSelect from "@/components/ui/DropSelect";

const SOURCE_OPTIONS = [
  "Ads",
  "Organic - FB",
  "Organic - IG",
  "Organic - TikTok",
  "Website",
  "Email",
  "Phone",
];

const STATUS_OPTIONS = [
  "Open",
  "In Progress",
  "Follow-Up Needed",
  "No Response",
  "Won",
  "Lost",
  "Not Qualified",
];

const STAGE_OPTIONS = [
  "Lead",
  "Qualified",
  "Presentation Completed",
  "Viewing Completed",
  "Proposal Sent",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

const NEXT_ACTION_OPTIONS = [
  "Call Client",
  "Send Message",
  "Send Email",
  "Follow Up",
  "Schedule Presentation",
  "Schedule Viewing / Tripping",
  "Send Proposal / Computation",
  "Reservation Processing",
  "Documentation Processing",
];

type FormData = {
  clientName: string;
  email: string;
  inquiryDate: string;
  phone: string;
  profileLink: string;
  project: string;
  lastUpdate: string;
  source: string;
  status: string;
  stage: string;
  nextAction: string;
  notes: string;
};

function LeadGeneration() {
  const [view, setView] = useState("form");
  const [formData, setFormData] = useState<FormData>({
    clientName: "",
    email: "",
    inquiryDate: new Date().toISOString().split("T")[0],
    phone: "",
    profileLink: "",
    project: "",
    lastUpdate: new Date().toISOString().split("T")[0],
    source: "",
    status: "",
    stage: "",
    nextAction: "",
    notes: "",
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

  const handleNext = () => {
    // Handle form submission / next step
    console.log(formData);
  };

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Digital Sales Lead Tracker"
          description="Manage your sales leads and projects here."
        />

        {/* Tabs */}
        <div className="flex justify-between items-center my-4">
          {/* TOGGLE VIEW SWITCH */}
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
                {t == "form" ? <PlusCircle size={18} /> : <Table size={18} />}{" "}
                {t == "form" ? "New Leads" : "View Leads"}
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        {view === "form" && (
          <div className="rounded-xl p-6 bg-white border-border border">
            {/* Customer Profile Section */}
            <h2 className="text-xl font-bold text-neutral-800 mb-4">
              Customer Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <TextInput
                label="First Name"
                type="text"
                placeholder="Enter First Name"
                className="col-span-2 md:col-span-1"
              />

              <TextInput
                label="Last Name"
                type="text"
                placeholder="Enter Last Name"
                className="col-span-2 md:col-span-1"
              />

              <TextInput
                label="Inquiry Date"
                type="date"
                placeholder="Select Inquiry Date"
                className="col-span-2 md:col-span-1"
              />

              <TextInput
                label="Phone"
                type="tel"
                placeholder="(0960) 600-1234"
                className="col-span-2 md:col-span-1"
              />

              <TextInput
                label="Profile Link"
                type="text"
                placeholder="https://..."
                className="col-span-2 md:col-span-1"
              />

              <DropSelect
                className="col-span-2 md:col-span-1"
                label="Project"
                selectName="project"
                selectId="project"
                onChange={(e) => handleSelectChange("project", e.target.value)}
              >
                <option value="">Select Project</option>
                <option value="Arcoe Residences">Arcoe Residences</option>
                <option value="Arcoe Estates">Arcoe Estates</option>
              </DropSelect>
            </div>

            <Separator className="my-6" />

            {/* Lead Details Section */}
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
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
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
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
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
                {STAGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </DropSelect>
             
              <DropSelect
                label="Next Action"
                selectName="nextAction"
                selectId="nextAction"
                onChange={(e) => handleSelectChange("nextAction", e.target.value)}
                className="col-span-2 md:col-span-1"
              >
                {NEXT_ACTION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </DropSelect>
            </div>

            {/* Notes + Next Button */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs text-neutral-600">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  placeholder="Add Notes"
                  onChange={handleInputChange}
                  className="border border-border text-sm resize-none min-h-[80px]"
                />
              </div>
            </div>

            <span className="flex justify-end mt-4">
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 px-8 self-end"
              >
                Next
              </Button>
            </span>
          </div>
        )}

        {/* View Leads placeholder */}
        {view === "table" && <LeadsTable table_name="Leads Table" />}
      </div>
    </main>
  );
}

export default LeadGeneration;
