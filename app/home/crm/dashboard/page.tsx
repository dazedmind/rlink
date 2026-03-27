"use client";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { crmQueryOptions } from "@/lib/crm/crm-query-options";
import {
  crmLeadsStatsFilters,
  crmReservationsRecentFilters,
} from "@/lib/crm/crm-filters";
import { fetchLeadsList, fetchReservationsList } from "@/lib/crm/crm-fetchers";
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
  const leadsStatsQuery = useQuery({
    queryKey: qk.leads(crmLeadsStatsFilters),
    queryFn: () => fetchLeadsList(crmLeadsStatsFilters),
    ...crmQueryOptions,
  });

  const reservationsSummaryQuery = useQuery({
    queryKey: qk.reservations(crmReservationsRecentFilters),
    queryFn: () => fetchReservationsList(crmReservationsRecentFilters),
    ...crmQueryOptions,
  });

  const allLeads = (leadsStatsQuery.data?.data ?? []) as { createdAt: string }[];
  const totalReservations = reservationsSummaryQuery.data?.total ?? 0;

  const statsError = leadsStatsQuery.isError || reservationsSummaryQuery.isError;
  const bothStatsLoaded =
    leadsStatsQuery.data !== undefined && reservationsSummaryQuery.data !== undefined;
  const showStatsSkeleton =
    !statsError &&
    !bothStatsLoaded &&
    (leadsStatsQuery.isPending || reservationsSummaryQuery.isPending);

  const { leadsThisMonth, leadsLastMonth, totalLeads } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastM = lastMonthDate.getMonth();
    const lastY = lastMonthDate.getFullYear();

    const thisMonthCount = allLeads.filter((lead) => {
      const d = new Date(lead.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const lastMonthCount = allLeads.filter((lead) => {
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
      increase: 0,
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

  const handleRetryStats = () => {
    void leadsStatsQuery.refetch();
    void reservationsSummaryQuery.refetch();
  };

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl bg-background">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="CRM Dashboard"
          description="Track your leads, client inquiries, and sales progression."
        />

        {statsError && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Could not load dashboard metrics.</span>
            <Button type="button" size="sm" variant="outline" onClick={handleRetryStats}>
              Retry
            </Button>
          </div>
        )}

        {showStatsSkeleton ? (
          <DashboardSkeleton />
        ) : (
          <div className="flex flex-col gap-8 animate-fade-in-up">
            <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
              {leadsCard.map((lead) => (
                <Card key={lead.id} className="flex flex-col justify-end h-[150px]">
                  <CardContent className="flex flex-col items-start">
                    <div className={`text-4xl font-bold ${lead.color}`}>{lead.leads}</div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-muted-foreground">{lead.label}</p>
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

                <LeadsTable table_name="Leads" recentViewOnly={true} />
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

                <ReservationTable table_name="Reservations" recentViewOnly={true} />
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
