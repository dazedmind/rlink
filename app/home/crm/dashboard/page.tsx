"use client";
import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import {
  Card, CardContent } from "@/components/ui/card";
import LeadsTable from "@/components/layout/LeadsTable";
import { FaCaretUp } from "react-icons/fa";


function CRMDashboard() {
  const [leadsThisMonth, setLeadsThisMonth] = useState(520);
  const [leadsLastMonth, setLeadsLastMonth] = useState(200);
  const [totalLeads, setTotalLeads] = useState(0);

  useEffect(() => {
    // const fetchLeads = async () => {
    //   const response = await fetch("/api/leads");
    //   const data = await response.json();
    //   setLeadsThisMonth(data.leadsThisMonth);
    //   setLeadsLastMonth(data.leadsLastMonth);
    //   setTotalLeads(data.totalLeads);
    // };

    setTotalLeads(leadsThisMonth + leadsLastMonth);
  }, []);

  const leads = [
    {id: 1, leads: leadsThisMonth, label: "Leads This Month", hasIncrease: true, color: "text-primary"},
    {id: 2, leads: leadsLastMonth, label: "Leads Last Month", hasIncrease: false, color: "text-neutral-500"},
    {id: 3, leads: totalLeads, label: "Total Accumulated Leads", hasIncrease: false, color: "text-primary"},
  ]
  
  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="CRM Dashboard"
          description="Track your leads, client inquiries, and sales progression."
        />
        
        <div className="flex flex-col gap-8">
          {/* TOP STATS CARDS */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {leads.map((lead) => (
              <Card key={lead.id} className="flex flex-col justify-end h-[150px]">
                <CardContent className="flex flex-col items-start">
                  <div className={`text-4xl font-bold ${lead.color}`}>{lead.leads}</div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-muted-foreground">{lead.label}</p>
                    {lead.hasIncrease && <p className="flex items-center text-xs text-green-600"><FaCaretUp className="size-4 text-green-600" /> +12%</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* LEADS TABLE SECTION */}
          <LeadsTable table_name="Recent Leads" />
        </div>

      </div>
    </main>
  );
}

export default CRMDashboard;