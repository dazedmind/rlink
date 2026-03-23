"use client";

import React, { useState, useEffect } from "react";
import { Check, Table } from "lucide-react";
import {
  ReservationFormStep1,
  type ReservationFormData,
} from "./ReservationFormStep1";
import { ReservationFormStep2 } from "./ReservationFormStep2";
import { ReservationFormStep3 } from "./ReservationFormStep3";

const EMPTY_FORM: ReservationFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
  project: "",
  inventoryCode: "",
  blockNumber: "",
  lotNumber: "",
  recipientEmail: "",
  ccEmail: "",
  bccEmail: "",
};

const STEPS = [
  { id: 1, name: "Enter Details" },
  { id: 2, name: "Attach Files" },
  { id: 3, name: "Review Details" },
];

type Props = {
  onComplete?: () => void;
  initialPrefill?: { projectName: string; block: number; lot: number } | null;
};

export function ReservationForm({ onComplete, initialPrefill }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ReservationFormData>(EMPTY_FORM);

  useEffect(() => {
    if (initialPrefill && (initialPrefill.block > 0 || initialPrefill.lot > 0)) {
      setFormData((prev) => ({
        ...prev,
        project: initialPrefill.projectName,
        blockNumber: String(initialPrefill.block),
        lotNumber: String(initialPrefill.lot),
      }));
    }
  }, [initialPrefill]);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setStep(1);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof ReservationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleComplete = () => {
    resetForm();
    onComplete?.();
  };

  return (
    <div className="mx-auto space-y-8 animate-fade-in-up">
      <nav className="flex items-center mt-8 px-2">
        {STEPS.map((s, i) => (
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
                className={`text-sm font-medium whitespace-nowrap ${
                  step >= s.id ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {s.name}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-24 h-0.5 mx-4 ${
                  step > s.id ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="border border-border rounded-2xl p-8">
        {step === 1 && (
          <ReservationFormStep1
            formData={formData}
            onChange={handleInputChange}
            onSelect={handleSelectChange}
            onNext={handleNext}
          />
        )}
        {step === 2 && (
          <ReservationFormStep2 onNext={handleNext} onBack={handleBack} />
        )}
        {step === 3 && (
          <ReservationFormStep3
            formData={formData}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
