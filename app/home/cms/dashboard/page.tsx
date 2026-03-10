"use client";
import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import {
  Card, CardContent } from "@/components/ui/card";
import LeadsTable from "@/components/tables/crm/LeadsTable";


function CMSDashboard() {
  const [leadsThisMonth, setLeadsThisMonth] = useState(24450);
  const [leadsLastMonth, setLeadsLastMonth] = useState(200);
  const [totalLeads, setTotalLeads] = useState(0);

  useEffect(() => {
    setTotalLeads(leadsThisMonth + leadsLastMonth);
  }, []);

  const leads = [
    {id: 1, leads: leadsThisMonth, label: "Total Views", hasIncrease: true},
    {id: 2, leads: "19%", label: "Bounce Rate", hasIncrease: false},
    {id: 3, leads: totalLeads, label: "Conversion Rate", hasIncrease: false},
    {id: 4, leads: "30s", label: "Average Engagement Time", hasIncrease: false},
  ]
  
  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl h-full bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Content Studio Manager"
          description="Track your leads, client inquiries, and sales progression."
        />
        
        <div className="flex flex-col gap-8">
          {/* TOP STATS CARDS */}
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {leads.map((lead) => (
              <Card key={lead.id} className="flex flex-col justify-end h-[150px]">
                <CardContent className="flex flex-col items-start">
                  <div className="text-4xl font-bold">{lead.leads}</div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-muted-foreground">{lead.label}</p>
                    {lead.hasIncrease && <p className="text-xs text-green-600">+12% from last month</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/*  TABLE SECTION */}
        </div>

      </div>
    </main>
  );
}

export default CMSDashboard;