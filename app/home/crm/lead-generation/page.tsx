"use client";

import React, { useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { PlusCircle, Table } from "lucide-react";
import LeadsTable from "@/components/tables/crm/LeadsTable";
import { LeadGenerationForm } from "@/components/layout/forms/LeadGenerationForm";

function LeadGeneration() {
  const [view, setView] = useState<"form" | "table">("form");

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Digital Sales Lead Tracker"
          description="Manage your sales leads and projects here."
        />

        <div className="flex justify-between items-center my-4">
          <div className="flex bg-accent rounded-[10px] p-1 gap-1">
            {(["form", "table"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setView(t)}
                className={`flex items-center cursor-pointer gap-2 px-4 py-1.5 rounded-[8px] text-[13px] font-medium capitalize transition-all duration-150 ${
                  view === t
                    ? "bg-primary text-white shadow-[0_1px_3px_rgba(0,0,0,0.10)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "form" ? <PlusCircle size={18} /> : <Table size={18} />}
                {t === "form" ? "New Lead" : "View Leads"}
              </button>
            ))}
          </div>
        </div>

        {view === "form" && (
          <LeadGenerationForm onSuccess={() => setView("table")} />
        )}

        {view === "table" && (
          <LeadsTable table_name="Leads Table" recentViewOnly={false} />
        )}
      </div>
    </main>
  );
}

export default LeadGeneration;
