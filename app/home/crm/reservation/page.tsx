"use client";

import React, { useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { PlusCircle, Table } from "lucide-react";
import ReservationTable from "@/components/tables/crm/ReservationTable";
import { ReservationForm } from "@/components/layout/forms/ReservationForm";

function Reservation() {
  const [view, setView] = useState<"form" | "table">("form");

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Reservation"
          description="Create a new unit reservation."
        />

        <div className="flex justify-between items-center my-4">
          <div className="flex bg-accent rounded-[10px] p-1 gap-1">
            {(["form", "table"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setView(t)}
                className={`flex items-center cursor-pointer gap-2 px-4 py-1.5 rounded-[8px] text-[13px] font-medium capitalize transition-all duration-150 ${
                  view === t
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "form" ? <PlusCircle size={18} /> : <Table size={18} />}
                {t === "form" ? "New Reservation" : "View Reservations"}
              </button>
            ))}
          </div>
        </div>

        {view === "form" ? (
          <ReservationForm onComplete={() => setView("table")} />
        ) : (
          <ReservationTable
            table_name="Reservations Table"
            recentViewOnly={false}
          />
        )}
      </div>
    </main>
  );
}

export default Reservation;
