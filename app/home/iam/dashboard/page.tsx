"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { IAM_USERS_LIST_KEY, fetchUsersList } from "@/lib/iam/iam-fetchers";
import { iamTableQueryOptions } from "@/lib/iam/iam-query-options";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import UsersTable from "@/components/tables/iam/UsersTable";
import ActivityLogsTable from "@/components/tables/iam/ActivityLogsTable";
import { Users, Building, Ban, ChevronRight } from "lucide-react";
import DashboardSkeleton from "@/components/layout/skeleton/DashboardSkeleton";
import { Button } from "@/components/ui/button";

function IamDashboard({
  setActiveTab,
}: {
  setActiveTab: (tab: string) => void;
}) {
  const usersQuery = useQuery({
    queryKey: IAM_USERS_LIST_KEY,
    queryFn: fetchUsersList,
    ...iamTableQueryOptions,
  });

  const totalUsers = usersQuery.data?.total ?? 0;
  const totalDepartments = 0;
  const deactivatedUsers = 0;

  const user_stats = [
    { id: 1, stats: totalUsers, label: "Total Users", icon: Users },
    { id: 2, stats: totalDepartments, label: "Total departments", icon: Building },
    { id: 3, stats: deactivatedUsers, label: "Deactivated Users", icon: Ban },
  ];

  const statsError = usersQuery.isError;
  const showStatsSkeleton =
    !statsError &&
    usersQuery.data === undefined &&
    usersQuery.isPending;

  const handleRetryStats = () => {
    void usersQuery.refetch();
  };

  return (
    <main className="flex-1 overflow-auto m-4 border-border border rounded-xl h-full bg-background">
      <div className="mx-auto p-8">
        <DashboardHeader
          title="Identity & Access Management (IAM)"
          description="Manage users, roles, and audit activity across your organization."
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
          <DashboardSkeleton variant="crm" />
        ) : (
          <div className="flex flex-col gap-8 animate-fade-in-up">
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {user_stats.map((user_stat) => (
                <Card
                  key={user_stat.id}
                  className="flex flex-col justify-end h-[150px] relative overflow-hidden"
                >
                  <CardContent className="flex flex-col items-start">
                    <div className="flex items-center gap-2 text-4xl font-bold">
                      {user_stat.stats}
                    </div>
                    <div className="flex items-center gap-2 z-30">
                      <p className="text-lg font-semibold text-muted-foreground">
                        {user_stat.label}
                      </p>
                    </div>

                    <span className="absolute -bottom-3 right-0 opacity-[0.06]">
                      <user_stat.icon className="size-20 stroke-2" />
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <span>
                    <h3 className="font-semibold text-xl">Recent Users</h3>
                    <p className="text-sm text-muted-foreground">
                      Latest accounts and profile details.
                    </p>
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab("manage-users")}
                    className="text-primary hover:text-primary/80 hover:bg-transparent"
                  >
                    View All Users <ChevronRight className="size-4" />
                  </Button>
                </div>
                <UsersTable
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onAdd={() => {}}
                  viewOnly
                  recentViewOnly
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <span>
                    <h3 className="font-semibold text-xl">Recent Activity</h3>
                    <p className="text-sm text-muted-foreground">
                      Latest sign-ins and account changes.
                    </p>
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab("activity-logs")}
                    className="text-primary hover:text-primary/80 hover:bg-transparent"
                  >
                    View All Logs <ChevronRight className="size-4" />
                  </Button>
                </div>
                <ActivityLogsTable recentViewOnly />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default IamDashboard;
