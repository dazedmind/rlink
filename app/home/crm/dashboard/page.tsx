"use client";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import LeadsTable from "@/components/tables/crm/LeadsTable";
import { FaCaretUp } from "react-icons/fa";
import ReservationTable from "@/components/tables/crm/ReservationTable";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import InquiryTable from "@/components/tables/crm/InquiryTable";
import DashboardSkeleton from "@/components/layout/skeleton/DashboardSkeleton";

function CRMDashboard({
  setActiveTab,
}: {
  setActiveTab: (tab: string) => void;
}) {
  const { data: leadsData, isLoading: loadingLeads } = useQuery({
    queryKey: qk.leads(),
    queryFn: async () => {
      const res = await fetch("/api/leads");
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: reservationsData, isLoading: loadingReservations } = useQuery({
    queryKey: qk.reservations({ limit: "1000" }),
    queryFn: async () => {
      const res = await fetch("/api/reservation?limit=1000");
      const json = await res.json();
      return { total: json.total ?? 0 };
    },
  });

  const allLeads = leadsData ?? [];
  const totalReservations = reservationsData?.total ?? 0;
  const loading = loadingLeads || loadingReservations;

  const { leadsThisMonth, leadsLastMonth, totalLeads } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastM = lastMonthDate.getMonth();
    const lastY = lastMonthDate.getFullYear();

    const thisMonthCount = allLeads.filter((lead: { createdAt: string }) => {
      const d = new Date(lead.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const lastMonthCount = allLeads.filter((lead: { createdAt: string }) => {
      const d = new Date(lead.createdAt);
      return d.getMonth() === lastM && d.getFullYear() === lastY;
    }).length;

    return {
      leadsThisMonth: thisMonthCount,
      leadsLastMonth: lastMonthCount,
      totalLeads: allLeads.length,
    };
  }, [allLeads]);

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
      hasIncrease: false,
      color: "text-neutral-500",
      increase: 0
    },
    {
      id: 3,
      leads: totalLeads,
      label: "Total Leads Generated",
      hasIncrease: false,
      color: "text-primary",
      increase: 0,
    },
    {
      id: 4,
      leads: totalReservations,
      label: "Total Reservations",
      hasIncrease: false,
      color: "text-purple-600",
      increase: 0,
    },
  ];

  const increasePercentage = (increase: number) => {
    if (leadsThisMonth === 0) return null;
    return ((increase / leadsThisMonth) * 100).toFixed(0);
  };

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="CRM Dashboard"
          description="Track your leads, client inquiries, and sales progression."
        />

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="flex flex-col gap-8 animate-fade-in-up">
            <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <span>
                    <h3 className="font-semibold text-xl">Recent Leads</h3>
                    <p className="text-sm text-muted-foreground">
                      Track your recent leads and their status.
                    </p>
                  </span>

                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab("lead-generation")}
                    className="text-primary hover:text-primary/80 hover:bg-transparent"
                  >
                    View All Leads <ChevronRight className="size-4" />
                  </Button>
                </div>

                <LeadsTable
                  table_name="Leads"
                  recentViewOnly={true}
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <span>
                    <h3 className="font-semibold text-xl">Recent Reservations</h3>
                    <p className="text-sm text-muted-foreground">
                      Track your recent reservations and their status.
                    </p>
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab("reservation")}
                    className="text-primary hover:text-primary/80 hover:bg-transparent"
                  >
                    View All Reservations <ChevronRight className="size-4" />
                  </Button>
                </div>

                <ReservationTable
                  table_name="Reservations"
                  recentViewOnly={true}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <span>
                  <h3 className="font-semibold text-xl">Recent Inquiries</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your recent inquiries and their status.
                  </p>
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("inquiries")}
                  className="text-primary hover:text-primary/80 hover:bg-transparent"
                >
                  View All Inquiries <ChevronRight className="size-4" />
                </Button>
              </div>

              <InquiryTable table_name="Inquiries" recentViewOnly={true} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default CRMDashboard;
