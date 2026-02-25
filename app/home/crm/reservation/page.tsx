import React, { useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import {
  Check,
  Upload,
  ArrowRight,
  PlusCircle,
  FileText,
  ChevronDownIcon,
  Table,
} from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import ReservationTable from "@/components/layout/ReservationTable";
import DropSelect from "@/components/ui/DropSelect";
import { Button } from "@/components/ui/button";

function Reservation() {
  // View Toggle: 'form' or 'table'
  const [view, setView] = useState("form");
  // Step Tracking: 1, 2, or 3
  const [step, setStep] = useState(1);

  const steps = [
    { id: 1, name: "Enter Details" },
    { id: 2, name: "Attach Files" },
    { id: 3, name: "Review Details" },
  ];

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
                {t == "form" ? "New Reservation" : "View Reservations"}
              </button>
            ))}
          </div>
        </div>

        {view === "form" ? (
          <div className="mx-auto space-y-8">
            {/* STEP NAVIGATION HEADER */}
            <nav className="flex items-center mt-8 px-2">
              {steps.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className="flex flex-row gap-2 items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= s.id ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400"}`}
                    >
                      {step > s.id ? <Check size={20} /> : s.id}
                    </div>
                    <span
                      className={` -bottom-7 text-sm font-medium whitespace-nowrap ${step >= s.id ? "text-blue-600" : "text-gray-400"}`}
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

            {/* STEP CONTENT */}
            <div className="border border-border rounded-2xl p-8">
              {step === 1 && <StepOne onNext={handleNext} />}
              {step === 2 && (
                <StepTwo onNext={handleNext} onBack={handleBack} />
              )}
              {step === 3 && (
                <StepThree
                  onBack={handleBack}
                  onComplete={() => setView("table")}
                />
              )}
            </div>
          </div>
        ) : (
          <ReservationTable />
        )}
      </div>
    </main>
  );
}

// --- SUB-COMPONENTS ---

function StepOne({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 ">
      <section>
        <h3 className="text-xl font-bold mb-4 text-neutral-800">
          Customer Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field className="col-span-2 md:col-span-1">
            <FieldLabel>Client First Name</FieldLabel>
            <Input type="text" placeholder="John" />
          </Field>
          <Field className="col-span-2 md:col-span-1">
            <FieldLabel>Client Last Name</FieldLabel>
            <Input type="text" placeholder="Doe" />
          </Field>
          <Field className="col-span-2 md:col-span-1">
            <FieldLabel>Client Email</FieldLabel>
            <Input type="email" placeholder="john.doe@example.com" />
          </Field>
          <DropSelect
            label="Inventory Code"
            selectName="inventoryCode"
            selectId="inventoryCode"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              e.target.value
            }
          >
            <option value="">Select Inventory Code</option>
            <option value="INV-001">INV-001</option>
            <option value="INV-002">INV-002</option>
          </DropSelect>

          <DropSelect
            label="Project"
            selectName="project"
            selectId="project"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              e.target.value
            }
          >
            <option value="">Select Project</option>
            <option value="Arcoe Residences">Arcoe Residences</option>
            <option value="Arcoe Estates">Arcoe Estates</option>
          </DropSelect>

          <span className="flex gap-4">
            <DropSelect
              label="Block Number"
              selectName="blockNumber"
              selectId="blockNumber"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                e.target.value
              }
              className="col-span-2 md:col-span-1"
            >
              <option value="">Select Block Number</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </DropSelect>
            <DropSelect
              label="Lot Number"
              selectName="lotNumber"
              selectId="lotNumber"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                e.target.value
              }
              className="col-span-2 md:col-span-1"
            >
              <option value="">Select Lot Number</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </DropSelect>
          </span>
        </div>
      </section>

      <section className="pt-6 border-t border-gray-200">
        <h3 className="text-xl font-bold mb-4 text-neutral-800">
          Send Email Section
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field className="col-span-2 md:col-span-1">
            <Input type="email" placeholder="recipient@email.com" />
          </Field>
          <Field className="col-span-2 md:col-span-1">
            <Input type="email" placeholder="cc@email.com" />
          </Field>
          <Field className="col-span-2 md:col-span-1">
            <Input type="email" placeholder="bcc@email.com" />
          </Field>
        </div>
      </section>

      <div className="flex justify-end">
        <Button
          variant="default"
          size="lg"
          onClick={onNext}
          className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
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
      <div className="border-2 border-dashed border-gray-300 rounded-xl py-12 px-4 bg-white hover:border-blue-400 transition-colors cursor-pointer group">
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Upload className="text-blue-600" />
        </div>
        <h3 className="text-lg font-medium">
          Click to upload or drag and drop
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Proof of Reservation, IDs, or Legal Documents (PDF, PNG, JPG)
        </p>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          className="text-gray-600 px-6 py-2 font-medium hover:text-gray-800"
        >
          Back
        </Button>
        <Button
          variant="default"
          size="lg"
          onClick={onNext}
          className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}

function StepThree({
  onBack,
  onComplete,
}: {
  onBack: () => void;
  onComplete: () => void;
}) {
  const confirmSubmit = () => {
    if (window.confirm("Are you sure you want to submit this reservation?")) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
          <FileText size={18} className="text-blue-600" /> Summary of Details
        </h3>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <span className="text-gray-500">Client Name:</span>{" "}
          <span className="font-medium">John Doe</span>
          <span className="text-gray-500">Project:</span>{" "}
          <span className="font-medium">The Grand Oasis</span>
          <span className="text-gray-500">Location:</span>{" "}
          <span className="font-medium">Block 12, Lot 5</span>
          <span className="text-gray-500">Email:</span>{" "}
          <span className="font-medium">john.doe@example.com</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          className="text-gray-600 px-6 py-2 font-medium"
        >
          Back
        </Button>
        <Button
          variant="default"
          size="lg"
          onClick={confirmSubmit}
          className="bg-green-600 text-white px-10 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-100"
        >
          Confirm & Submit Reservation
        </Button>
      </div>
    </div>
  );
}

export default Reservation;
