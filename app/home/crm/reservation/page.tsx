"use client";
import React, { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import {
  Check,
  Upload,
  ArrowRight,
  PlusCircle,
  FileText,
  Table,
} from "lucide-react";
import ReservationTable from "@/components/layout/ReservationTable";
import DropSelect from "@/components/ui/DropSelect";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/ui/TextInput";
import { toast } from "sonner";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  inventoryCode: string;
  project: string;
  blockNumber: string;
  lotNumber: string;
  recipientEmail: string;
  ccEmail: string;
  bccEmail: string;
}

function Reservation() {
  const [view, setView] = useState<"form" | "table">("form");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    inventoryCode: "",
    project: "",
    blockNumber: "",
    lotNumber: "",
    recipientEmail: "",
    ccEmail: "",
    bccEmail: "",
  });

  const steps = [
    { id: 1, name: "Enter Details" },
    { id: 2, name: "Attach Files" },
    { id: 3, name: "Review Details" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Reservation"
          description="Create a new unit reservation."
        />

        <div className="flex justify-between items-center my-4">
          <div className="flex bg-[#F2F2F7] rounded-[10px] p-1 gap-1">
            {(["form", "table"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setView(t)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-[8px] text-[13px] font-medium capitalize transition-all duration-150 ${
                  view === t
                    ? "bg-primary text-white shadow-sm"
                    : "text-[#8E8E93] hover:text-[#1C1C1E]"
                }`}
              >
                {t === "form" ? <PlusCircle size={18} /> : <Table size={18} />}
                {t === "form" ? "New Reservation" : "View Reservations"}
              </button>
            ))}
          </div>
        </div>

        {view === "form" ? (
          <div className="mx-auto space-y-8">
            <nav className="flex items-center mt-8 px-2">
              {steps.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className="flex flex-row gap-2 items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        step >= s.id
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 text-gray-400"
                      }`}
                    >
                      {step > s.id ? <Check size={20} /> : s.id}
                    </div>
                    <span
                      className={`text-sm font-medium whitespace-nowrap ${step >= s.id ? "text-blue-600" : "text-gray-400"}`}
                    >
                      {s.name}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-24 h-0.5 mx-4 ${step > s.id ? "bg-blue-600" : "bg-gray-200"}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </nav>

            <div className="border border-border rounded-2xl p-8">
              {step === 1 && (
                <StepOne
                  formData={formData}
                  onChange={handleInputChange}
                  onSelect={handleSelectChange}
                  onNext={handleNext}
                />
              )}
              {step === 2 && (
                <StepTwo onNext={handleNext} onBack={handleBack} />
              )}
              {step === 3 && (
                <StepThree
                  formData={formData}
                  onBack={handleBack}
                  onComplete={() => setView("table")}
                />
              )}
            </div>
          </div>
        ) : (
          <ReservationTable
            table_name="Reservation Table"
            recentViewOnly={false}
          />
        )}
      </div>
    </main>
  );
}

/** --- SUB-COMPONENTS --- **/

function StepOne({ formData, onChange, onSelect, onNext }: any) {
  const [projectsList, setProjectsList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);

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

  const handleNext = () => {
    if (formData.inventoryCode === "" || formData.project === "") {
      toast.error("Please select an inventory code and project to continue.");
      return;
    } else {
      onNext();
    }
  };
    
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h3 className="text-xl font-bold mb-4 text-neutral-800">
          Customer Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextInput
            label="Client First Name"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={onChange}
            placeholder="John"
            hasLabel
          />
          <TextInput
            label="Client Last Name"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={onChange}
            placeholder="Doe"
            hasLabel
          />
          <TextInput
            label="Client Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            placeholder="john@example.com"
            hasLabel
          />
          
          <TextInput
            label="Client Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={onChange}
            placeholder="(0960) 600-1234"
            hasLabel
          />

          <DropSelect
            label="Inventory Code"
            selectName="inventoryCode"
            selectId="inventoryCode"
            onChange={(e: any) => onSelect("inventoryCode", e.target.value)}
            hasLabel
          >
            <option value="">Select Code</option>
            {projectsList.map((project: any) => (
              <option key={project.id} value={project.id}>{project.projectCode}</option>
            ))}
          </DropSelect>

          <DropSelect
            label="Project"
            selectName="project"
            selectId="project"
            onChange={(e: any) => onSelect("project", e.target.value)}
            hasLabel
          >
            <option value="">Select Project</option>
            {projectsList.map((project: any) => (
              <option key={project.id} value={project.projectName}>{project.projectName}</option>
            ))}
          </DropSelect>

            <DropSelect
              label="Block"
              selectName="blockNumber"
              selectId="blockNumber"
              onChange={(e: any) => onSelect("blockNumber", e.target.value)}
              hasLabel
            >
              <option value="">Select Block</option>
              {inventoryList.map((inventory: any) => (
                <option key={inventory.id} value={inventory.block}>{inventory.block}</option>
              ))}
            </DropSelect>

            <DropSelect
              label="Lot"
              selectName="lotNumber"
              selectId="lotNumber"
              onChange={(e: any) => onSelect("lotNumber", e.target.value)}
              hasLabel
            >
              <option value="">Select Lot</option>
              {inventoryList.map((inventory: any) => (
                <option key={inventory.id} value={inventory.lot}>{inventory.lot}</option>
              ))}
            </DropSelect>    
        </div>
      </section>

      <section className="pt-6 border-t border-gray-200">
        <h3 className="text-xl font-bold mb-4 text-neutral-800">
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
            hasLabel
          />
          <TextInput
            label="CC Email"
            name="ccEmail"
            type="email"
            value={formData.ccEmail}
            onChange={onChange}
            placeholder="cc@email.com"
            hasLabel
          />
          <TextInput
            label="BCC Email"
            name="bccEmail"
            type="email"
            value={formData.bccEmail}
            onChange={onChange}
            placeholder="bcc@email.com"
            hasLabel
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

function StepTwo({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-center">
      <div className="border-2 border-dashed border-gray-300 rounded-xl py-12 px-4 hover:border-blue-400 transition-colors cursor-pointer group">
        <Upload
          className="mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform"
          size={40}
        />
        <h3 className="text-lg font-medium">
          Click to upload or drag and drop
        </h3>
        <p className="text-gray-500 text-sm">
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

function StepThree({ formData, onBack, onComplete }: any) {

  const handleSubmitReservation = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.inventoryCode || !formData.project || !formData.blockNumber || !formData.lotNumber || !formData.recipientEmail || !formData.ccEmail || !formData.bccEmail) {
        toast.error("Please fill in all fields.");
        return;
      }
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Failed to submit reservation.");
      }
      toast.success("Reservation submitted successfully!");
      onComplete();
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
          <FileText size={18} className="text-blue-600" /> Summary of Details
        </h3>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <span className="text-gray-500">Client Name:</span>
          <span className="font-medium">
            {formData.firstName} {formData.lastName}
          </span>
          <span className="text-gray-500">Project:</span>
          <span className="font-medium">
            {formData.project || "Not Selected"}
          </span>
          <span className="text-gray-500">Location:</span>
          <span className="font-medium">
            Block {formData.blockNumber || "?"}, Lot {formData.lotNumber || "?"}
          </span>
          <span className="text-gray-500">Client Email:</span>
          <span className="font-medium">{formData.email || "N/A"}</span>
          <span className="text-gray-500">Recipient Email:</span>
          <span className="font-medium">
            {formData.recipientEmail || "N/A"}
          </span>
          <span className="text-gray-500">CC Email:</span>
          <span className="font-medium">
            {formData.ccEmail || "N/A"}
          </span>
          <span className="text-gray-500">BCC Email:</span>
          <span className="font-medium">
            {formData.bccEmail || "N/A"}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleSubmitReservation}
          className="bg-green-600 text-white px-10 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-100"
        >
          Confirm & Submit Reservation
        </Button>
      </div>
    </div>
  );
}

export default Reservation;
