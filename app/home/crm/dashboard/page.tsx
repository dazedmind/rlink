"use client";
import React, { useState, useEffect, useMemo } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import LeadsTable from "@/components/layout/LeadsTable";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import ReservationTable from "@/components/layout/ReservationTable";

function CRMDashboard() {
  // 1. Consolidated state to avoid multiple re-renders
  const [allLeads, setAllLeads] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("/api/leads");
        const data = await response.json();
        // Set all data at once
        setAllLeads(data.data || []);
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    };
    fetchLeads();
  }, []);

  // 2. Memoized calculations for performance and reliability
  const { leadsThisMonth, leadsLastMonth, totalLeads } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Correctly handle January rollover for "Last Month" calculation
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastM = lastMonthDate.getMonth();
    const lastY = lastMonthDate.getFullYear();

    const thisMonthCount = allLeads.filter((lead: any) => {
      const d = new Date(lead.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const lastMonthCount = allLeads.filter((lead: any) => {
      const d = new Date(lead.createdAt);
      return d.getMonth() === lastM && d.getFullYear() === lastY;
    }).length;

    return {
      leadsThisMonth: thisMonthCount,
      leadsLastMonth: lastMonthCount,
      totalLeads: allLeads.length,
    };
  }, [allLeads]); // Only recalculates when allLeads changes

  const leadsCard = [
    {
      id: 1,
      leads: leadsThisMonth,
      label: "Leads This Month",
      hasIncrease: leadsThisMonth > leadsLastMonth,
      color: "text-primary",
      increase: leadsThisMonth - leadsLastMonth,
    },
    {
      id: 2,
      leads: leadsLastMonth,
      label: "Leads Last Month",
      hasIncrease: leadsLastMonth > leadsThisMonth,
      color: "text-neutral-500",
      increase: leadsLastMonth - leadsThisMonth,
    },
    {
      id: 3,
      leads: totalLeads,
      label: "Total Accumulated Leads",
      hasIncrease: totalLeads > leadsThisMonth + leadsLastMonth,
      color: "text-primary",
      increase: totalLeads - (leadsThisMonth + leadsLastMonth),
    },
  ];

  const increasePercentage = (increase: number) => {
    // Added safety check to prevent NaN if leadsThisMonth is 0
    if (leadsThisMonth === 0) return 0;
    return ((increase / leadsThisMonth) * 100).toFixed(0);
  };

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-white">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="CRM Dashboard"
          description="Track your leads, client inquiries, and sales progression."
        />

        <div className="flex flex-col gap-8">
          {/* TOP STATS CARDS - UI remains identical */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {leadsCard.map((lead) => (
              <Card
                key={lead.id}
                className="flex flex-col justify-end h-[150px]"
              >
                <CardContent className="flex flex-col items-start">
                  <div className={`text-4xl font-bold ${lead.color}`}>
                    {lead.leads}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-muted-foreground">
                      {lead.label}
                    </p>
                    {lead.hasIncrease && (
                      <p className="flex items-center text-xs text-green-600">
                        <FaCaretUp className="size-4 text-green-600" />{" "}
                        {increasePercentage(lead.increase)}%
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <LeadsTable table_name="Recent Leads" recentViewOnly={true} />
          <ReservationTable table_name="Recent Reservations" recentViewOnly={true} />
        </div>
      </div>
    </main>
  );
}

export default CRMDashboard;