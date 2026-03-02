"use client";
import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import LeadsTable from "@/components/tables/LeadsTable";

function Users() {
  const [leadsThisMonth, setLeadsThisMonth] = useState(24450);
  const [leadsLastMonth, setLeadsLastMonth] = useState(200);
  const [totalLeads, setTotalLeads] = useState(0);

  useEffect(() => {
    setTotalLeads(leadsThisMonth + leadsLastMonth);
  }, []);

  const leads = [
    { id: 1, leads: 0, label: "Total Views", hasIncrease: true },
    { id: 2, leads: "0%", label: "Bounce Rate", hasIncrease: false },
    { id: 3, leads: 0, label: "Conversion Rate", hasIncrease: false },
    { id: 4, leads: "0", label: "Average Engagement Time", hasIncrease: false },
  ];

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl h-full bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Users"
          description="Track your leads, client inquiries, and sales progression."
        />

        <div className="flex flex-col gap-8">
          <div className="mt-8">
            <LeadsTable table_name="Users" recentViewOnly={true} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default Users;
